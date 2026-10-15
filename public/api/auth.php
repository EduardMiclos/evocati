<?php
// Admin authentication.
//   GET                      → { authenticated, mustChangePassword }
//   POST ?action=login       { password }
//   POST ?action=logout
//   POST ?action=password    { current, next }
declare(strict_types=1);
require __DIR__ . '/lib.php';

start_session();
$action = $_GET['action'] ?? '';

if (!is_post()) {
    $idle = time() - (int) ($_SESSION['seen'] ?? 0);
    $ok = !empty($_SESSION['admin']) && $idle <= SESSION_IDLE_SECONDS;
    json_out([
        'authenticated' => $ok,
        'mustChangePassword' => $ok && !empty(admin_record()['initial']),
    ]);
}

$body = require_post();

switch ($action) {
    case 'login':
        if (!rate_limit('login', 5, 15 * 60)) {
            json_out(['error' => 'Prea multe încercări. Încearcă din nou peste 15 minute.'], 429);
        }
        $admin = admin_record();
        if (!password_verify(str_field($body, 'password', 200), $admin['hash'])) {
            json_out(['error' => 'Parolă incorectă.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        $_SESSION['seen'] = time();
        json_out(['authenticated' => true, 'mustChangePassword' => !empty($admin['initial'])]);

    case 'logout':
        $_SESSION = [];
        session_destroy();
        json_out(['ok' => true]);

    case 'password':
        require_admin();
        $current = str_field($body, 'current', 200);
        $next = str_field($body, 'next', 200);
        if (!password_verify($current, admin_record()['hash'])) {
            json_out(['error' => 'Parola actuală este incorectă.'], 400);
        }
        if (mb_strlen($next) < 10) {
            json_out(['error' => 'Parola nouă trebuie să aibă cel puțin 10 caractere.'], 400);
        }
        if ($next === $current) {
            json_out(['error' => 'Parola nouă trebuie să fie diferită de cea actuală.'], 400);
        }
        store_write('admin', ['hash' => password_hash($next, PASSWORD_DEFAULT), 'changedAt' => date('c')]);
        session_regenerate_id(true);
        json_out(['ok' => true]);

    default:
        json_out(['error' => 'Acțiune necunoscută.'], 400);
}
