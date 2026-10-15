<?php
// Received "Solicită o analiză" requests (admin only).
//   GET                         → { submissions }
//   POST ?action=read   { id }  marks one as read
//   POST ?action=delete { id }
declare(strict_types=1);
require __DIR__ . '/lib.php';

require_admin();

if (!is_post()) {
    json_out(['submissions' => store_read('submissions')]);
}

$body = require_post();
$id = str_field($body, 'id', 32);
$all = store_read('submissions');

switch ($_GET['action'] ?? '') {
    case 'read':
        foreach ($all as &$s) {
            if ($s['id'] === $id) {
                $s['read'] = true;
            }
        }
        unset($s);
        break;
    case 'delete':
        $all = array_values(array_filter($all, fn ($s) => $s['id'] !== $id));
        break;
    default:
        json_out(['error' => 'Acțiune necunoscută.'], 400);
}

store_write('submissions', $all);
json_out(['ok' => true, 'submissions' => $all]);
