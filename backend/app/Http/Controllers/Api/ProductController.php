<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Http\Traits\ApiResponse;

class ProductController extends Controller
{
    use ApiResponse;
    public function index(Request $request)
    {
    $query = Product::query()->with('category');

        if ($q = $request->input('q')) {
            $query->where('name', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%");
        }

        if ($category = $request->input('category')) {
            // Accept either a numeric category_id or a category slug
            $query->when(is_numeric($category), function ($q) use ($category) {
                $q->where('category_id', $category);
            }, function ($q) use ($category) {
                $q->whereHas('category', function ($qq) use ($category) {
                    $qq->where('slug', $category);
                });
            });
        }

        $perPage = (int) $request->input('per_page', 12);
    $data = $query->paginate($perPage);

        // append image_url to each product in the paginator's collection
        $data->getCollection()->transform(function (Product $p) {
            $p->append('image_url');
            return $p;
        });

    return $this->ok($data);
    }

    public function show(Product $product)
    {
        $product->load('category', 'reviews');
    $product->append('image_url');
    return $this->ok($product);
    }

    /**
     * Update product image(s). Admin only.
     */
    public function updateImage(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $data = $request->validate([
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        if (array_key_exists('image', $data)) {
            $product->image = $data['image'];
        }

        if (array_key_exists('images', $data)) {
            $product->images = $data['images'];
        }

        $product->save();

        return $this->ok([
            'id' => $product->id,
            'image' => $product->image,
            'image_url' => $product->image_url,
            'images' => $product->images ?? [],
        ]);
    }

    /**
     * Update product images (multiple). Admin only.
     */
    public function updateImages(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $data = $request->validate([
            'images' => 'required|array|max:10', // Maximum 10 images
            'images.*' => 'string|max:2048',
            'primary_image_index' => 'nullable|integer|min:0',
        ]);

        $images = $data['images'];
        $primaryIndex = $data['primary_image_index'] ?? 0;

        // S'assurer que l'index primaire est valide
        if ($primaryIndex >= count($images)) {
            $primaryIndex = 0;
        }

        // Mettre l'image primaire en position 0
        if ($primaryIndex > 0 && isset($images[$primaryIndex])) {
            $primaryImage = $images[$primaryIndex];
            unset($images[$primaryIndex]);
            array_unshift($images, $primaryImage);
        }

        $product->images = array_values($images);
        $product->image = $images[0] ?? null; // L'image principale est la première
        $product->save();

        return $this->ok([
            'id' => $product->id,
            'image' => $product->image,
            'image_url' => $product->image_url,
            'images' => $product->images ?? [],
        ]);
    }

    /**
     * Store a new product (admin only).
     */
    public function store(Request $request)
    {
        $this->authorize('create', Product::class);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'sale_price' => 'nullable|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'image' => 'nullable|string',
            'images' => 'nullable|array|max:10',
            'images.*' => 'string|max:2048',
            'category_id' => 'nullable|exists:categories,id',
            'status' => 'nullable|string', // front peut l'envoyer, on recalculera
        ]);

        // slug automatique si absent
        if (empty($data['slug'])) {
            $base = Str::slug($data['name']);
            $slug = $base;
            $i = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $base.'-'.$i++;
            }
            $data['slug'] = $slug;
        }

        // Gestion des images multiples
        if (isset($data['images']) && !empty($data['images'])) {
            // Si on a des images multiples, la première devient l'image principale
            if (empty($data['image'])) {
                $data['image'] = $data['images'][0];
            }
        }

        $fillable = ['name','slug','description','price','sale_price','image','images','category_id'];
        $product = Product::create(array_intersect_key($data, array_flip($fillable)));

        // Stock géré en colonne séparée éventuellement
        if (array_key_exists('stock', $data)) {
            $product->stock = (int)$data['stock'];
            $product->save();
        }

        $product->load('category');
        $product->append('image_url');
        return $this->created($product);
    }

    /**
     * Update a product (admin only).
     */
    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255|unique:products,slug,'.$product->id,
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|required|integer|min:0',
            'sale_price' => 'sometimes|nullable|integer|min:0',
            'stock' => 'sometimes|nullable|integer|min:0',
            'image' => 'sometimes|nullable|string',
            'images' => 'sometimes|nullable|array|max:10',
            'images.*' => 'string|max:2048',
            'category_id' => 'sometimes|nullable|exists:categories,id',
        ]);

        // Gestion des images multiples
        if (isset($data['images']) && !empty($data['images'])) {
            // Si on a des images multiples, la première devient l'image principale
            if (empty($data['image']) || !array_key_exists('image', $data)) {
                $data['image'] = $data['images'][0];
            }
        }

        $product->fill($data);
        if (array_key_exists('stock', $data)) {
            $product->stock = (int)$data['stock'];
        }
        $product->save();

        $product->load('category');
        $product->append('image_url');
        return $this->ok($product);
    }

    /**
     * Delete product (admin only)
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        $product->delete();
    return $this->ok(['message' => 'Deleted']);
    }

    /**
     * PATCH /admin/products/{product}/stock
     * Atomic admin stock adjustment route.
     */
    public function updateStock(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $data = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product->stock = (int)$data['stock'];
        // Optionally toggle in_stock flag for consumer convenience
        $product->in_stock = $product->stock > 0;
        $product->save();

        return $this->ok([
            'id' => $product->id,
            'stock' => $product->stock,
            'in_stock' => $product->in_stock,
        ]);
    }
}
