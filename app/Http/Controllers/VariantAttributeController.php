<?php

namespace App\Http\Controllers;

use App\Models\VariantAttribute;
use App\Models\VariantAttributeValue;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VariantAttributeController extends Controller
{
    public function index()
    {
        $atributos = VariantAttribute::with(['values' => fn ($q) => $q->orderBy('value')])
            ->orderBy('name')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'values' => $a->values->map(fn ($v) => [
                    'id' => $v->id,
                    'attribute_id' => $v->attribute_id,
                    'value' => $v->value,
                ])->values(),
            ]);

        return ApiResponse::success($atributos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:variant_attributes,name',
        ]);

        $atributo = VariantAttribute::create($validated);

        return ApiResponse::success($this->format($atributo->load('values')), 'Atributo creado', 201);
    }

    public function update(Request $request, VariantAttribute $atributo)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('variant_attributes', 'name')->ignore($atributo->id)],
        ]);

        $atributo->update($validated);

        return ApiResponse::success($this->format($atributo->load('values')), 'Atributo actualizado');
    }

    public function destroy(VariantAttribute $atributo)
    {
        $enUso = VariantAttributeValue::where('attribute_id', $atributo->id)
            ->whereHas('productVariants')
            ->exists();

        if ($enUso) {
            return ApiResponse::error('No se puede eliminar: el atributo está en uso por variantes existentes.', 409, 'ATTRIBUTION_IN_USE');
        }

        $atributo->delete();

        return ApiResponse::success(null, 'Atributo eliminado');
    }

    public function storeValue(Request $request, VariantAttribute $atributo)
    {
        $validated = $request->validate([
            'value' => [
                'required',
                'string',
                'max:100',
                Rule::unique('variant_attribute_values', 'value')->where('attribute_id', $atributo->id),
            ],
        ]);

        $valor = $atributo->values()->create($validated);

        return ApiResponse::success([
            'id' => $valor->id,
            'attribute_id' => $valor->attribute_id,
            'value' => $valor->value,
        ], 'Valor creado', 201);
    }

    public function updateValue(Request $request, VariantAttributeValue $valor)
    {
        $validated = $request->validate([
            'value' => [
                'required',
                'string',
                'max:100',
                Rule::unique('variant_attribute_values', 'value')
                    ->where('attribute_id', $valor->attribute_id)
                    ->ignore($valor->id),
            ],
        ]);

        $valor->update($validated);

        return ApiResponse::success([
            'id' => $valor->id,
            'attribute_id' => $valor->attribute_id,
            'value' => $valor->value,
        ], 'Valor actualizado');
    }

    public function destroyValue(VariantAttributeValue $valor)
    {
        $enUso = $valor->productVariants()->exists();

        if ($enUso) {
            return ApiResponse::error('No se puede eliminar: el valor está en uso por variantes existentes.', 409, 'VALUE_IN_USE');
        }

        $valor->delete();

        return ApiResponse::success(null, 'Valor eliminado');
    }

    private function format(VariantAttribute $atributo): array
    {
        return [
            'id' => $atributo->id,
            'name' => $atributo->name,
            'values' => $atributo->values->map(fn ($v) => [
                'id' => $v->id,
                'attribute_id' => $v->attribute_id,
                'value' => $v->value,
            ])->values(),
        ];
    }
}
