<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Traits\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    use ApiResponse;
    public function index()
    {
        // Charger le nombre de produits par catégorie pour l'affichage frontend
        $categories = Category::query()
            ->withCount('products')
            ->get()
            ->map(function (Category $c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'description' => $c->description,
                    'image' => $c->image,
                    'image_url' => $c->image_url,
                    'images' => $c->images ?? [],
                    'products_count' => $c->products_count, // utilisé par le frontend
                ];
            });

        return $this->ok($categories);
    }

    public function show(Category $category)
    {
        $category->load('products');

        $payload = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image,
            'image_url' => $category->image_url,
            'images' => $category->images ?? [],
            'products' => $category->products()->limit(24)->get(),
        ];

    return $this->ok($payload);
    }

    /**
     * Update category image(s). Admin only.
     * Accepts 'image' (string path) or 'images' (array of paths) — prefer using UploadController to store files.
     */
    public function updateImage(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $data = $request->validate([
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        if (array_key_exists('image', $data)) {
            $category->image = $data['image'];
        }

        if (array_key_exists('images', $data)) {
            $category->images = $data['images'];
        }

        $category->save();

        return $this->ok([
            'id' => $category->id,
            'image' => $category->image,
            'image_url' => $category->image_url,
            'images' => $category->images ?? [],
        ]);
    }

    /**
     * Store a new category (admin only via route middleware).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        if (empty($data['slug'])) {
            $base = Str::slug($data['name']);
            $slug = $base; $i = 1;
            while (Category::where('slug', $slug)->exists()) { $slug = $base.'-'.$i++; }
            $data['slug'] = $slug;
        }

        $category = Category::create(array_intersect_key($data, array_flip(['name','slug','description','image','images','parent_id'])));
        $payload = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image,
            'image_url' => $category->image_url,
            'images' => $category->images ?? [],
        ];
    return $this->created($payload);
    }

    /**
     * Update an existing category (admin only).
     */
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:categories,name,'.$category->id,
            'slug' => 'sometimes|nullable|string|max:255|unique:categories,slug,'.$category->id,
            'description' => 'sometimes|nullable|string',
            'image' => 'sometimes|nullable|string',
            'images' => 'sometimes|nullable|array',
            'images.*' => 'string',
            'parent_id' => 'sometimes|nullable|exists:categories,id',
        ]);

        // Auto slug if provided name but empty slug field
        if (!array_key_exists('slug', $data) && array_key_exists('name', $data)) {
            $base = Str::slug($data['name']);
            if ($category->slug !== $base) {
                $slug = $base; $i = 1;
                while (Category::where('slug', $slug)->where('id','!=',$category->id)->exists()) { $slug = $base.'-'.$i++; }
                $data['slug'] = $slug;
            }
        }

        $category->fill($data);
        $category->save();

        $payload = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image,
            'image_url' => $category->image_url,
            'images' => $category->images ?? [],
        ];
    return $this->ok($payload);
    }

    /**
     * Delete category (admin only). NOTE: Products referencing this category will have FK behavior (set null / restrict) per migration.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return $this->ok(['message' => 'Deleted']);
    }

    /**
     * Bulk delete categories by ids. Expects JSON body: { ids: [1,2,3] }
     */
    public function bulkDestroy(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:categories,id'
        ]);

        $ids = $data['ids'];
        // Optionally ensure authorization per category
        $count = Category::whereIn('id', $ids)->count();
        Category::whereIn('id', $ids)->delete();
        return $this->ok(['deleted' => $count]);
    }
}
