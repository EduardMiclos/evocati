<?php
// Email server settings (admin only).
//   GET               → settings, with the SMTP password replaced by `hasPassword`
//   POST              { ...settings }  (empty `password` keeps the saved one)
//   POST ?action=test { to? }          sends a test email with the saved settings
declare(strict_types=1);
require __DIR__ . '/lib.php';
require __DIR__ . '/mailer.php';

require_admin();

function public_settings(): array
{
    $s = mail_settings();
    $s['hasPassword'] = $s['password'] !== '';
    unset($s['password']);
    return $s;
}

if (!is_post()) {
    json_out(['settings' => public_settings()]);
}

$body = require_post();

if (($_GET['action'] ?? '') === 'test') {
    $cfg = mail_settings();
    $to = parse_recipients(str_field($body, 'to', 300)) ?: parse_recipients($cfg['recipients']);
    try {
        send_mail(
            $cfg,
            $to,
            'Test email — Evocati',
            "Acesta este un email de test trimis din panoul de administrare Evocati.\n\n" .
            'Dacă îl primești, cererile din formularul „Solicită o analiză” vor ajunge la: ' .
            implode(', ', parse_recipients($cfg['recipients'])) . "\n",
        );
    } catch (RuntimeException $e) {
        json_out(['error' => $e->getMessage()], 502);
    }
    json_out(['ok' => true, 'sentTo' => $to]);
}

$current = mail_settings();
$next = [
    'transport' => in_array($body['transport'] ?? '', ['smtp', 'mail'], true) ? $body['transport'] : 'smtp',
    'host' => str_field($body, 'host', 200),
    'port' => max(1, min(65535, (int) ($body['port'] ?? 465))),
    'secure' => in_array($body['secure'] ?? '', ['ssl', 'tls', 'none'], true) ? $body['secure'] : 'ssl',
    'username' => str_field($body, 'username', 200),
    'password' => str_field($body, 'password', 500) !== '' ? str_field($body, 'password', 500) : $current['password'],
    'fromEmail' => str_field($body, 'fromEmail', 200),
    'fromName' => str_field($body, 'fromName', 120),
    'recipients' => str_field($body, 'recipients', 1000),
    'subject' => str_field($body, 'subject', 200),
];

if (!empty($body['clearPassword'])) {
    $next['password'] = '';
}
if ($next['fromEmail'] !== '' && !filter_var($next['fromEmail'], FILTER_VALIDATE_EMAIL)) {
    json_out(['error' => 'Adresa „De la” nu este validă.'], 400);
}
if ($next['recipients'] !== '' && !parse_recipients($next['recipients'])) {
    json_out(['error' => 'Niciun destinatar valid.'], 400);
}

store_write('mail', $next);
json_out(['ok' => true, 'settings' => public_settings()]);
