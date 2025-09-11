<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('sanctum csrf cookie is available', function () {
    $response = $this->get('/sanctum/csrf-cookie');
    $response->assertStatus(204)->assertCookie('XSRF-TOKEN');
});

test('login json returns token and user', function () {
    $user = User::factory()->create();

    $response = $this->postJson(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)->assertJsonStructure(['user', 'token', 'token_type']);
    expect($response->json('token'))->not()->toBeNull();
});

test('access protected route with bearer token and logout revokes token', function () {
    $user = User::factory()->create();
    $login = $this->postJson(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $token = $login->json('token');
    expect($token)->not()->toBeNull();

    $me = $this->withHeaders(['Authorization' => "Bearer {$token}"])->getJson('/api/auth/me');
    $me->assertStatus(200)->assertJsonFragment(['email' => $user->email]);

    $logout = $this->withHeaders(['Authorization' => "Bearer {$token}"])->postJson('/api/auth/logout');
    $logout->assertStatus(200)->assertJson(['message' => 'logged_out']);

    // subsequent access should fail
    $me2 = $this->withHeaders(['Authorization' => "Bearer {$token}"])->getJson('/api/auth/me');
    $me2->assertStatus(401);
});
