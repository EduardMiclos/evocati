<?php
// "Solicită o analiză" form (public).
//   POST { name, company, phone, email, amount, message, website(honeypot) }
// Stores the request (visible in the admin) and emails it to the configured recipients.
declare(strict_types=1);
require __DIR__ . '/lib.php';
require __DIR__ . '/mailer.php';

$body = require_post();

// Bots fill the hidden "website" field; pretend success and drop it.
if (str_field($body, 'website', 200) !== '') {
    json_out(['ok' => true]);
}
if (!rate_limit('contact', 5, 60 * 60)) {
    json_out(['error' => 'Prea multe cereri trimise. Te rugăm să ne suni'], 429);
}

$entry = [
    'id' => bin2hex(random_bytes(8)),
    'createdAt' => date('c'),
    'name' => str_field($body, 'name', 120),
    'company' => str_field($body, 'company', 160),
    'phone' => str_field($body, 'phone', 40),
    'email' => str_field($body, 'email', 160),
    'amount' => str_field($body, 'amount', 60),
    'message' => str_field($body, 'message', 4000),
    'read' => false,
];

if ($entry['name'] === '' || $entry['phone'] === '') {
    json_out(['error' => 'Numele și telefonul sunt obligatorii'], 400);
}
if ($entry['email'] !== '' && !filter_var($entry['email'], FILTER_VALIDATE_EMAIL)) {
    json_out(['error' => 'Adresa de email nu este validă'], 400);
}

$cfg = mail_settings();
$recipients = parse_recipients($cfg['recipients']);
$text = "Cerere nouă din formularul „Solicită o analiză”\n\n" .
    "Nume:      {$entry['name']}\n" .
    "Companie:  {$entry['company']}\n" .
    "Telefon:   {$entry['phone']}\n" .
    "Email:     {$entry['email']}\n" .
    "Valoare:   {$entry['amount']}\n\n" .
    "Situația:\n{$entry['message']}\n\n" .
    '— trimis la ' . date('d.m.Y H:i') . "\n";

// The request is saved even if email delivery fails, so nothing is lost.
try {
    send_mail($cfg, $recipients, strtr($cfg['subject'] ?: 'Cerere nouă', ['{name}' => $entry['name']]), $text, $entry['email'] ?: null);
    $entry['mailStatus'] = 'sent';
} catch (RuntimeException $e) {
    $entry['mailStatus'] = 'failed';
    $entry['mailError'] = $e->getMessage();
}

$all = store_read('submissions');
array_unshift($all, $entry);
store_write('submissions', array_slice($all, 0, 1000));

json_out(['ok' => true]);
