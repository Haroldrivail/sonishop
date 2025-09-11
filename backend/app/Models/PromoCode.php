<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code','discount','type','active','valid_from','valid_until','usage_limit','used_count','min_order_amount'
    ];

    protected $casts = [
        'active' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'min_order_amount' => 'integer',
        'discount' => 'integer',
        'used_count' => 'integer',
    ];

    public function isActive(): bool
    {
        if (! $this->active) return false;
        $now = Carbon::now();
        if ($this->valid_from && $now->lt($this->valid_from)) return false;
        if ($this->valid_until && $now->gt($this->valid_until)) return false;
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;
        return true;
    }

    public function canApplyToAmount(int $amount): bool
    {
        return $amount >= ($this->min_order_amount ?? 0);
    }

    /**
     * Calculate discount amount in cents given an order amount in cents.
     */
    public function calculateForAmount(int $amount): int
    {
        if ($this->type === 'percentage') {
            return (int) floor($amount * ($this->discount / 100));
        }
        // fixed amount
        return min($this->discount, $amount);
    }
}
