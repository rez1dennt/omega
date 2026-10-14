<?php
declare(strict_types=1);

// Copy to mail.local.php outside public_html. Never commit the real password.
return [
    'enabled' => false,
    'smtp_host' => 'smtp.mail.ru',
    'smtp_port' => 465,
    'smtp_username' => 'omegakomplekt@mail.ru',
    'smtp_password' => '', // Mail.ru app password, not the normal mailbox password.
    'site_origin' => '', // Example: https://omega-company.ru, without trailing slash.
    'require_https' => true,
];
