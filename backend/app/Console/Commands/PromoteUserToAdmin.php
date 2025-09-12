<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class PromoteUserToAdmin extends Command
{
    protected $signature = 'user:promote-admin {email}';
    protected $description = 'Promote a user by email to admin role';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $user->assignRole('admin');
        $this->info("Promoted {$email} to admin.");
        return 0;
    }
}
