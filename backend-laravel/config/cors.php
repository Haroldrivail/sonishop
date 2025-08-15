<?php

return [

    'paths' => ['api/*', 'login', 'logout', 'sanctum/csrf-cookie','admin/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173',
     'http://public.test',],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
