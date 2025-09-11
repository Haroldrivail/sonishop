<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PromoCode;
use App\Http\Traits\ApiResponse;

class PromoController extends Controller
{
    use ApiResponse;
    /**
     * Validate a promo code against an order amount (in cents).
     * Payload: { code: string, amount: integer }
     */
    public function validateCode(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
            'amount' => 'required|integer|min:0',
        ]);

        $promo = PromoCode::where('code', strtoupper($data['code']))->first();

        if (! $promo || ! $promo->isActive()) {
            return $this->ok(['valid' => false, 'reason' => 'invalid_or_inactive']);
        }

        if (! $promo->canApplyToAmount($data['amount'])) {
            return $this->ok(['valid' => false, 'reason' => 'min_amount']);
        }

        $discount = $promo->calculateForAmount($data['amount']);

    return $this->ok(['valid' => true, 'discount' => $discount, 'type' => $promo->type]);
    }
}
