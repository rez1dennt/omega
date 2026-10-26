<?php
defined( 'ABSPATH' ) || exit;
return json_decode( (string) file_get_contents( __DIR__ . '/content.json' ), true );
