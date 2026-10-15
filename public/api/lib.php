<?php
// Shared helpers for the Evocati API: storage, JSON I/O, admin session, rate limits.
declare(strict_types=1);

if (get_included_files()[0] === __FILE__) { http_response_code(404); exit; }

require __DIR__ . '/config.php';

// Data files are PHP files whose first line stops execution, so their contents can't be
// downloaded even if the host ignores api/data/.htaccess.
const DATA_GUARD = "<?php http_response_code(404); exit; ?>\n";

function data_dir(): string
{
    $dir = getenv('EVOCATI_DATA_DIR') ?: __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0750, true) && !is_dir($dir)) {
        json_out(['error' => 'Nu pot crea directorul de date.'], 500);
    }
    return $dir;
}

function store_read(string $name, array $default = []): array
{
    $file = data_dir() . "/$name.php";
    if (!is_file($file)) {
        return $default;
    }
    $raw = (string) file_get_contents($file);
    $value = json_decode(substr($raw, strlen(DATA_GUARD)), true);
    return is_array($value) ? $value : $default;
}

function store_write(string $name, array $value): void
{
    $file = data_dir() . "/$name.php";
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($tmp, DATA_GUARD . $json, LOCK_EX) === false || !rename($tmp, $file)) {
        @unlink($tmp);
        json_out(['error' => 'Nu pot salva datele (verifică permisiunile pentru api/data).'], 500);
    }
    @chmod($file, 0640);
}

function json_out(array $data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function request_body(): array
{
    $data = json_decode((string) file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function is_post(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

// Every write must carry the custom header the front-end sends. Browsers don't let
// a cross-site form set it, which (with SameSite cookies) blocks CSRF.
function require_post(): array
{
    if (!is_post()) {
        json_out(['error' => 'Metodă nepermisă.'], 405);
    }
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'evocati') {
        json_out(['error' => 'Cerere invalidă.'], 400);
    }
    return request_body();
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['SERVER_PORT'] ?? '') === '443'
        || strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

// Behind Firebase Hosting / Cloud Run, REMOTE_ADDR is Google's proxy; the visitor's IP
// is the first X-Forwarded-For entry. Only trusted when EVOCATI_TRUST_PROXY=1.
function client_ip(): string
{
    if (getenv('EVOCATI_TRUST_PROXY') === '1' && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Public host name of the site (Firebase forwards the original one in X-Forwarded-Host).
function site_host(): string
{
    $raw = getenv('EVOCATI_TRUST_PROXY') === '1' && !empty($_SERVER['HTTP_X_FORWARDED_HOST'])
        ? explode(',', $_SERVER['HTTP_X_FORWARDED_HOST'])[0]
        : ($_SERVER['HTTP_HOST'] ?? '');
    $host = strtolower(preg_replace('/:\d+$/', '', trim($raw)));
    return preg_match('/^[a-z0-9.-]{1,253}$/', $host) ? $host : '';
}

// 'cpanel' (default) or 'firebase'. On Firebase, HTTPS and certificates are managed by Google.
function platform(): string
{
    return getenv('EVOCATI_PLATFORM') === 'firebase' ? 'firebase' : 'cpanel';
}

function str_field(array $src, string $key, int $max): string
{
    $v = $src[$key] ?? '';
    if (!is_string($v)) {
        return '';
    }
    return mb_substr(trim($v), 0, $max);
}

/* ─────────────── Admin session ─────────────── */

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    // Firebase Hosting only forwards a cookie named "__session" to Cloud Run.
    session_name(getenv('EVOCATI_SESSION_NAME') ?: 'evocati_admin');
    // Cloud Run instances are disposable, so sessions are kept with the other data there.
    if ($dir = getenv('EVOCATI_SESSION_DIR')) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        session_save_path($dir);
    }
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function admin_record(): array
{
    // Until the admin sets their own password, the initial hash from config.php is used.
    return store_read('admin', ['hash' => INITIAL_ADMIN_HASH, 'initial' => true]);
}

function require_admin(): void
{
    start_session();
    $idle = time() - (int) ($_SESSION['seen'] ?? 0);
    if (empty($_SESSION['admin']) || $idle > SESSION_IDLE_SECONDS) {
        $_SESSION = [];
        json_out(['error' => 'Sesiune expirată. Autentifică-te din nou.'], 401);
    }
    $_SESSION['seen'] = time();
}

/* ─────────────── Rate limiting ─────────────── */

// Allows `$max` hits per `$window` seconds for this bucket + client IP.
function rate_limit(string $bucket, int $max, int $window): bool
{
    $key = $bucket . ':' . hash('sha256', client_ip());
    $now = time();
    $all = store_read('ratelimit');
    foreach ($all as $k => $hits) {
        $all[$k] = array_values(array_filter((array) $hits, fn ($t) => $t > $now - 86400));
        if (!$all[$k]) {
            unset($all[$k]);
        }
    }
    $recent = array_filter($all[$key] ?? [], fn ($t) => $t > $now - $window);
    if (count($recent) >= $max) {
        store_write('ratelimit', $all);
        return false;
    }
    $all[$key][] = $now;
    store_write('ratelimit', $all);
    return true;
}
