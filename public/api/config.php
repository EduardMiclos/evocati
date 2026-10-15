<?php
// Static configuration. Runtime settings (texts, email server, admin password) live in
// api/data/ and are edited from the admin dashboard, so updating the site files never
// overwrites them.
declare(strict_types=1);

if (get_included_files()[0] === __FILE__) { http_response_code(404); exit; }

// bcrypt hash of the initial admin password. Used only until the admin sets a new
// password from the dashboard (forced on first login).
const INITIAL_ADMIN_HASH = '$2y$10$H8ZTxfBcePd4lkToL8YV1eI7sv7dD6VYFmq5aOq43s3LSJoUrN4be';

// Dates in emails and the requests list use Romanian time.
date_default_timezone_set('Europe/Bucharest');

// Admin session expires after this much inactivity.
const SESSION_IDLE_SECONDS = 2 * 60 * 60;

// The site's root .htaccess (one level above api/), edited by the "Force HTTPS" toggle.
function htaccess_path(): string
{
    return getenv('EVOCATI_HTACCESS') ?: dirname(__DIR__) . '/.htaccess';
}
