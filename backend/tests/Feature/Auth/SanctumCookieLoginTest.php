<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('cookie login flow using csrf cookie and credentials', function () {
    $user = User::factory()->create();

    // get CSRF cookie
    $this->get('/sanctum/csrf-cookie')->assertStatus(204)->assertCookie('XSRF-TOKEN');

    // post to login route with session credentials (web flow) - expect redirect
    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect();
    $this->assertAuthenticated();
});
