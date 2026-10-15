<?php
// Outgoing email: a minimal SMTP client (SSL / STARTTLS / AUTH LOGIN) plus a PHP mail()
// fallback, so it works on shared hosting without Composer or PHPMailer.
declare(strict_types=1);

if (get_included_files()[0] === __FILE__) { http_response_code(404); exit; }

const MAIL_DEFAULTS = [
    'transport' => 'smtp',         // 'smtp' | 'mail'
    'host' => '',
    'port' => 465,
    'secure' => 'ssl',             // 'ssl' (465) | 'tls' (STARTTLS, 587) | 'none'
    'username' => '',
    'password' => '',
    'fromEmail' => '',
    'fromName' => 'Evocati',
    'recipients' => '',            // comma-separated
    'subject' => 'Cerere nouă de analiză — {name}',
];

function mail_settings(): array
{
    return array_merge(MAIL_DEFAULTS, store_read('mail'));
}

/** @return string[] */
function parse_recipients(string $list): array
{
    $out = [];
    foreach (preg_split('/[,;\s]+/', $list) ?: [] as $addr) {
        if (filter_var($addr, FILTER_VALIDATE_EMAIL)) {
            $out[] = $addr;
        }
    }
    return array_values(array_unique($out));
}

// Strips CR/LF so user input can never inject extra mail headers.
function header_safe(string $v): string
{
    return trim(str_replace(["\r", "\n"], ' ', $v));
}

function encode_header(string $v): string
{
    $v = header_safe($v);
    return preg_match('/[^\x20-\x7e]/', $v) ? '=?UTF-8?B?' . base64_encode($v) . '?=' : $v;
}

/**
 * Sends a plain-text UTF-8 email. Throws RuntimeException with a readable reason.
 * @param string[] $to
 */
function send_mail(array $cfg, array $to, string $subject, string $body, ?string $replyTo = null): void
{
    if (!$to) {
        throw new RuntimeException('Nu există destinatari valizi configurați.');
    }
    $from = $cfg['fromEmail'] ?: $cfg['username'];
    if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Adresa expeditorului („De la”) nu este validă.');
    }

    $domain = substr(strrchr($from, '@') ?: '@localhost', 1);
    $headers = [
        'Date: ' . date('r'),
        'From: ' . encode_header($cfg['fromName'] ?: 'Evocati') . " <$from>",
        'To: ' . implode(', ', $to),
        'Subject: ' . encode_header($subject),
        'Message-ID: <' . bin2hex(random_bytes(12)) . "@$domain>",
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = "Reply-To: $replyTo";
    }
    $encodedBody = chunk_split(base64_encode($body), 76, "\r\n");

    if ($cfg['transport'] === 'mail') {
        // mail() adds To and Subject itself.
        $extra = array_filter($headers, fn ($h) => !preg_match('/^(To|Subject):/', $h));
        $ok = mail(implode(', ', $to), encode_header($subject), $encodedBody, implode("\r\n", $extra), "-f$from");
        if (!$ok) {
            throw new RuntimeException('Funcția mail() a serverului a refuzat mesajul.');
        }
        return;
    }

    $smtp = new SmtpClient((string) $cfg['host'], (int) $cfg['port'], (string) $cfg['secure']);
    try {
        $smtp->connect();
        if ($cfg['username'] !== '') {
            $smtp->auth((string) $cfg['username'], (string) $cfg['password']);
        }
        $smtp->send($from, $to, implode("\r\n", $headers) . "\r\n\r\n" . $encodedBody);
    } finally {
        $smtp->quit();
    }
}

final class SmtpClient
{
    /** @var resource|null */
    private $sock = null;

    public function __construct(private string $host, private int $port, private string $secure)
    {
        if ($host === '') {
            throw new RuntimeException('Serverul SMTP nu este configurat.');
        }
    }

    public function connect(): void
    {
        $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true]]);
        $scheme = $this->secure === 'ssl' ? 'ssl' : 'tcp';
        $sock = @stream_socket_client("$scheme://{$this->host}:{$this->port}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
        if (!$sock) {
            throw new RuntimeException("Nu mă pot conecta la {$this->host}:{$this->port} ($errstr).");
        }
        stream_set_timeout($sock, 20);
        $this->sock = $sock;
        $this->expect(220);
        $this->ehlo();

        if ($this->secure === 'tls') {
            $this->cmd('STARTTLS', 220);
            $methods = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT') ? STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT : 0);
            if (!stream_socket_enable_crypto($this->sock, true, $methods)) {
                throw new RuntimeException('Negocierea TLS (STARTTLS) a eșuat.');
            }
            $this->ehlo();
        }
    }

    public function auth(string $user, string $pass): void
    {
        $this->cmd('AUTH LOGIN', 334);
        $this->cmd(base64_encode($user), 334);
        $this->cmd(base64_encode($pass), 235, 'Autentificarea SMTP a eșuat (utilizator sau parolă greșită)');
    }

    /** @param string[] $to */
    public function send(string $from, array $to, string $message): void
    {
        $this->cmd("MAIL FROM:<$from>", 250);
        foreach ($to as $rcpt) {
            $this->cmd("RCPT TO:<$rcpt>", [250, 251]);
        }
        $this->cmd('DATA', 354);
        // Dot-stuffing: a line starting with "." must be doubled.
        $message = preg_replace('/^\./m', '..', $message);
        $this->cmd($message . "\r\n.", 250);
    }

    public function quit(): void
    {
        if ($this->sock) {
            @fwrite($this->sock, "QUIT\r\n");
            @fclose($this->sock);
            $this->sock = null;
        }
    }

    private function ehlo(): void
    {
        $name = preg_replace('/[^a-zA-Z0-9.-]/', '', $_SERVER['SERVER_NAME'] ?? '') ?: 'localhost';
        $this->cmd("EHLO $name", 250);
    }

    /** @param int|int[] $expect */
    private function cmd(string $line, int|array $expect, string $context = ''): string
    {
        fwrite($this->sock, $line . "\r\n");
        return $this->expect($expect, $context);
    }

    /** @param int|int[] $expect */
    private function expect(int|array $expect, string $context = ''): string
    {
        $reply = '';
        while (($line = fgets($this->sock, 1024)) !== false) {
            $reply .= $line;
            // Multi-line replies use "250-…"; the last line is "250 …".
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        $code = (int) substr($reply, 0, 3);
        if (!in_array($code, (array) $expect, true)) {
            $msg = trim($reply) ?: 'fără răspuns (timeout)';
            throw new RuntimeException(($context ?: 'Serverul SMTP a răspuns neașteptat') . ": $msg");
        }
        return $reply;
    }
}
