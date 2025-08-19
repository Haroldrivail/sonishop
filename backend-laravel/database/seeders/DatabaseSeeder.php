<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
   public function run()
{
    try {
        User::create([
            'name' => 'Yvan',
            'email' => 'baronyvan07@gmail.com',
            'password' => bcrypt('AZER1234@&21w'),
            'role' => 'admin',
            'email_verified_at' => now()
        ]);
    } catch (\Illuminate\Database\QueryException $e) {
        if ($e->errorInfo[1] == 1062) {
            // Code 1062 = erreur de duplication MySQL
            echo "L'admin existe déjà - pas de nouvelle création\n";
        } else {
            throw $e;
        }
    }
   
    User::factory()->count(5)->create([
    'role' => 'client',
    'password' => bcrypt('Client123!')
]);
}
}
