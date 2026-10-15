<?php
// Site texts.
//   GET   → { overrides: { key: text } }   (public; only fields changed in the admin)
//   POST  { overrides }                     (admin; replaces all overrides)
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (!is_post()) {
    json_out(['overrides' => (object) store_read('content')]);
}

$body = require_post();
require_admin();

$in = $body['overrides'] ?? null;
if (!is_array($in) || count($in) > 1000) {
    json_out(['error' => 'Date invalide.'], 400);
}

$clean = [];
foreach ($in as $key => $value) {
    if (!is_string($key) || !preg_match('/^[a-zA-Z0-9_.-]{1,80}$/', $key) || !is_string($value)) {
        json_out(['error' => "Câmp invalid: $key"], 400);
    }
    $clean[$key] = mb_substr($value, 0, 5000);
}

store_write('content', $clean);
json_out(['ok' => true, 'overrides' => (object) $clean]);
