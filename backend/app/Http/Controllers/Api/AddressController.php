<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Address;
use App\Http\Traits\ApiResponse;

class AddressController extends Controller
{
    use ApiResponse;
    public function index(Request $request)
    {
    return $this->ok($request->user()->addresses()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => 'string|nullable',
            'first_name' => 'string|nullable',
            'last_name' => 'string|nullable',
            'phone' => 'string|nullable',
            'address_line' => 'required|string',
            'city' => 'string|nullable',
            'postal_code' => 'string|nullable',
            'country' => 'string|nullable',
            'is_default' => 'boolean',
        ]);

        $address = $request->user()->addresses()->create($data);

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

    return $this->created($address);
    }

    public function update(Request $request, Address $address)
    {
        $this->authorize('update', $address);

        $data = $request->validate([
            'label' => 'string|nullable',
            'first_name' => 'string|nullable',
            'last_name' => 'string|nullable',
            'phone' => 'string|nullable',
            'address_line' => 'string|nullable',
            'city' => 'string|nullable',
            'postal_code' => 'string|nullable',
            'country' => 'string|nullable',
            'is_default' => 'boolean',
        ]);

        $address->update($data);

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

    return $this->ok($address);
    }

    public function destroy(Request $request, Address $address)
    {
        $this->authorize('delete', $address);
        $address->delete();
    return $this->ok(['deleted' => true]);
    }
}
