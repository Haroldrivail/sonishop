<?php

use Illuminate\Support\Str;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('register requires email verification before token', function () {
    $email = 'user+'.Str::random(5).'@example.test';

    $payload = [
        'name' => 'Test User',
        'email' => $email,
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ];

    $response = $this->postJson('/api/auth/register', $payload);

    $response->assertStatus(201)
        ->assertJsonPath('email_verification_required', true)
        ->assertJsonPath('user.email', $email)
        ->assertJsonMissing(['token']);
});

