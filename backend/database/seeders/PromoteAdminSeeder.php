<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class PromoteAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        if (! $email) {
            $this->command->info('ADMIN_EMAIL not set; skipping PromoteAdminSeeder');
            return;
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->command->info("No user with email {$email} found; skipping.");
            return;
        }

        $user->assignRole('admin');
        $this->command->info("Promoted {$email} to admin");
    }
}
