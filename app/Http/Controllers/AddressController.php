<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index()
    {
        $direcciones = Address::where('user_id', auth()->id())->orderBy('es_principal', 'desc')->get();

        return ApiResponse::success($direcciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:100',
            'pais' => 'nullable|string|max:100',
            'ciudad' => 'required|string|max:150',
            'direccion' => 'required|string|max:255',
            'codigo_postal' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:30',
            'es_principal' => 'nullable|boolean',
        ]);

        if (!empty($validated['es_principal'])) {
            Address::where('user_id', auth()->id())->update(['es_principal' => false]);
        }

        $direccion = Address::create(array_merge($validated, ['user_id' => auth()->id()]));

        return ApiResponse::success($direccion, 'Dirección creada', 201);
    }

    public function update(Request $request, Address $direccion)
    {
        if ($direccion->user_id !== auth()->id()) {
            return ApiResponse::error('No autorizado', 403, 'FORBIDDEN');
        }

        $validated = $request->validate([
            'label' => 'nullable|string|max:100',
            'pais' => 'nullable|string|max:100',
            'ciudad' => 'sometimes|string|max:150',
            'direccion' => 'sometimes|string|max:255',
            'codigo_postal' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:30',
            'es_principal' => 'nullable|boolean',
        ]);

        if (!empty($validated['es_principal'])) {
            Address::where('user_id', auth()->id())->where('id', '!=', $direccion->id)
                ->update(['es_principal' => false]);
        }

        $direccion->update($validated);

        return ApiResponse::success($direccion, 'Dirección actualizada');
    }

    public function destroy(Address $direccion)
    {
        if ($direccion->user_id !== auth()->id()) {
            return ApiResponse::error('No autorizado', 403, 'FORBIDDEN');
        }

        $direccion->delete();

        return ApiResponse::success(null, 'Dirección eliminada');
    }
}