<?php
// SSL / HTTPS (admin only).
//   GET                    → certificate status for the current domain + force-HTTPS state
//   POST { forceHttps }    toggles the HTTPS redirect block in the site's .htaccess
//
// Certificates themselves are issued by the host (cPanel → SSL/TLS Status → AutoSSL);
// this endpoint only reports on them and controls the redirect.
declare(strict_types=1);
require __DIR__ . '/lib.php';

require_admin();

const BLOCK_BEGIN = '# BEGIN Evocati HTTPS';
const BLOCK_END = '# END Evocati HTTPS';
const REDIRECT_LINES = [
    '<IfModule mod_rewrite.c>',
    '  RewriteEngine On',
    '  RewriteCond %{HTTPS} !=on',
    '  RewriteCond %{HTTP:X-Forwarded-Proto} !https',
    '  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
    '</IfModule>',
];

function read_cert(string $host, bool $verify): array|string
{
    $ctx = stream_context_create(['ssl' => [
        'capture_peer_cert' => true,
        'verify_peer' => $verify,
        'verify_peer_name' => $verify,
        'peer_name' => $host,
        'SNI_enabled' => true,
    ]]);
    $sock = @stream_socket_client("ssl://$host:443", $errno, $errstr, 8, STREAM_CLIENT_CONNECT, $ctx);
    if (!$sock) {
        $last = error_get_last()['message'] ?? $errstr;
        return $last ?: 'conexiune eșuată';
    }
    $params = stream_context_get_params($sock);
    fclose($sock);
    $cert = $params['options']['ssl']['peer_certificate'] ?? null;
    return $cert ? (openssl_x509_parse($cert) ?: 'certificat ilizibil') : 'niciun certificat';
}

function cert_status(string $host): array
{
    if ($host === '' || $host === 'localhost' || filter_var($host, FILTER_VALIDATE_IP)) {
        return ['checked' => false, 'reason' => 'Verificarea funcționează doar pe un domeniu public (nu pe localhost / IP).'];
    }
    $verified = read_cert($host, true);
    $info = is_array($verified) ? $verified : read_cert($host, false);
    if (!is_array($info)) {
        return ['checked' => true, 'valid' => false, 'error' => "Nu există HTTPS pe $host: $info"];
    }
    $validTo = (int) ($info['validTo_time_t'] ?? 0);
    return [
        'checked' => true,
        'valid' => is_array($verified),
        'error' => is_array($verified) ? null : cert_problem($host, $info),
        'subject' => $info['subject']['CN'] ?? '',
        'altNames' => str_replace('DNS:', '', $info['extensions']['subjectAltName'] ?? ''),
        'issuer' => trim(($info['issuer']['O'] ?? '') . ' ' . ($info['issuer']['CN'] ?? '')),
        'validFrom' => date('c', (int) ($info['validFrom_time_t'] ?? 0)),
        'validTo' => date('c', $validTo),
        'daysLeft' => (int) floor(($validTo - time()) / 86400),
    ];
}

// Human-readable reason a certificate failed verification.
function cert_problem(string $host, array $info): string
{
    if ((int) ($info['validTo_time_t'] ?? 0) < time()) {
        return 'Certificatul a expirat pe ' . date('d.m.Y', (int) $info['validTo_time_t']) . '. Rulează AutoSSL din cPanel.';
    }
    $names = array_map('trim', explode(',', str_replace('DNS:', '', $info['extensions']['subjectAltName'] ?? '')));
    $covered = false;
    foreach ($names as $n) {
        $covered = $covered || $n === $host || (str_starts_with($n, '*.') && substr($host, strpos($host, '.') ?: 0) === substr($n, 1));
    }
    if (!$covered) {
        return "Certificatul nu acoperă domeniul $host (acoperă: " . implode(', ', array_filter($names)) . '). Rulează AutoSSL pentru acest domeniu.';
    }
    return 'Certificatul nu este emis de o autoritate de încredere (posibil auto-semnat). Rulează AutoSSL din cPanel.';
}

function htaccess_state(): array
{
    $file = htaccess_path();
    if (!is_file($file)) {
        return ['exists' => false, 'writable' => is_writable(dirname($file)), 'forceHttps' => false];
    }
    $text = (string) file_get_contents($file);
    $block = '';
    if (preg_match('/' . preg_quote(BLOCK_BEGIN, '/') . '.*?' . preg_quote(BLOCK_END, '/') . '/s', $text, $m)) {
        $block = $m[0];
    }
    return [
        'exists' => true,
        'writable' => is_writable($file),
        'forceHttps' => (bool) preg_match('/^\s*RewriteRule\b/m', $block),
    ];
}

function write_redirect_block(bool $enable): void
{
    $file = htaccess_path();
    $text = is_file($file) ? (string) file_get_contents($file) : '';
    $lines = array_map(fn ($l) => $enable ? $l : "# $l", REDIRECT_LINES);
    $block = BLOCK_BEGIN . " (managed from the admin dashboard → Securitate)\n" . implode("\n", $lines) . "\n" . BLOCK_END;
    $pattern = '/' . preg_quote(BLOCK_BEGIN, '/') . '.*?' . preg_quote(BLOCK_END, '/') . '/s';
    // The redirect must run before the other rules, so a new block goes at the top.
    $text = preg_match($pattern, $text) ? preg_replace($pattern, $block, $text, 1) : $block . "\n\n" . $text;
    if (file_put_contents($file, $text, LOCK_EX) === false) {
        json_out(['error' => 'Nu pot scrie fișierul .htaccess (verifică permisiunile).'], 500);
    }
}

$host = site_host();

// Firebase Hosting issues and renews certificates itself and always serves HTTPS.
if (platform() === 'firebase') {
    if (is_post()) {
        json_out(['error' => 'Pe Firebase, HTTPS este activ permanent; nu e nimic de comutat.'], 400);
    }
    json_out([
        'host' => $host,
        'managed' => true,
        'requestIsHttps' => true,
        'certificate' => cert_status($host),
        'htaccess' => ['exists' => false, 'writable' => false, 'forceHttps' => true],
    ]);
}

if (!is_post()) {
    json_out([
        'host' => $host,
        'requestIsHttps' => is_https(),
        'certificate' => cert_status($host),
        'htaccess' => htaccess_state(),
    ]);
}

$body = require_post();
$enable = !empty($body['forceHttps']);

if ($enable && !is_https()) {
    $cert = cert_status($host);
    if (empty($cert['valid'])) {
        json_out(['error' => 'Nu activez redirecționarea: domeniul nu are un certificat SSL valid. ' .
            'Emite-l din cPanel → SSL/TLS Status → Run AutoSSL, apoi încearcă din nou.'], 400);
    }
}

write_redirect_block($enable);
json_out(['ok' => true, 'htaccess' => htaccess_state()]);
