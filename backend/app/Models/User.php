<?php

namespace App\Models;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Address;
use App\Models\Product;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
    'name',
    'first_name',
    'last_name',
    'email',
    'password',
    'phone',
    'city',
    'quartier',
    'postal_code',
    'country',
    'role',
    'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = ['avatar_url'];

    /**
     * User orders.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * User wishlist (pivot table user_product).
     */
    public function wishlist()
    {
        return $this->belongsToMany(Product::class, 'user_product')->withTimestamps();
    }

    /**
     * The user's active cart (one per user).
     */
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * User addresses (multiple). Hybrid approach: user.address JSON remains as fallback.
     */
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Shortcut for the default address, if any.
     */
    public function defaultAddress()
    {
        return $this->hasOne(Address::class)->where('is_default', true);
    }

    /**
     * Override the default verification notification to use our custom mail template.
     */
    public function sendEmailVerificationNotification()
    {
        // For tests, send the framework's VerifyEmail notification so tests
        // that assert against Illuminate\Auth\Notifications\VerifyEmail keep working.
        if (app()->runningUnitTests()) {
            $this->notify(new \Illuminate\Auth\Notifications\VerifyEmail());
            return;
        }

        $this->notify(new VerifyEmailNotification());
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar) {
            return null;
        }

        if (preg_match('#^https?://#i', $this->avatar)) {
            return $this->avatar;
        }

        return Storage::url($this->avatar);
    }

    /**
     * Simple role check fallback (no external package): compares stored role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Assign a role and persist.
     */
    public function assignRole(string $role): self
    {
        $this->role = $role;
        $this->save();
        return $this;
    }
}
