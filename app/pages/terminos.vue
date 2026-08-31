<script setup lang="ts">
const storeName = computed(() => useStoreConfigStore().storeName)

useSeoMeta({
  title: 'Términos y condiciones',
  description: 'Lee los términos y condiciones de uso de nuestra tienda.'
})
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="max-w-3xl mx-auto space-y-8">
      <h1 class="text-3xl font-semibold tracking-tight">
        Términos y condiciones
      </h1>

      <div class="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            1. Aceptación de los términos
          </h2>
          <p>
            Al acceder y utilizar {{ storeName || 'nuestra tienda' }},
            usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo
            con alguno de estos términos, no debe utilizar nuestro servicio.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            2. Cuenta de usuario
          </h2>
          <p>
            Para realizar compras, usted debe crear una cuenta con información veraz y actualizada.
            Es responsable de mantener la confidencialidad de sus credenciales y de todas las
            actividades realizadas bajo su cuenta.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            3. Productos y precios
          </h2>
          <p>
            Los precios mostrados incluyen los impuestos aplicables salvo indicación contraria.
            Nos reservamos el derecho de modificar precios sin previo aviso,though los pedidos
            ya confirmados no se verán afectados por cambios de precio posteriores.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            4. Pedidos y pagos
          </h2>
          <p>
            Al realizar un pedido, usted está haciendo una oferta de compra. Nos reservamos el
            derecho de aceptar o rechazar pedidos por razones de disponibilidad, errores de precio
            o sospecha de fraude.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            5. Envíos y entregas
          </h2>
          <p>
            Los tiempos de entrega son estimados y pueden variar según la ubicación y la
            disponibilidad del producto. No nos hacemos responsables por retrasos causados por
            terceros en la cadena logística.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            6. Devoluciones
          </h2>
          <p>
            Usted puede solicitar la devolución de un producto dentro de los 30 días posteriores
            a la recepción, siempre que el producto se encuentre en su estado original. Consulte
            nuestra política de devoluciones para más detalles.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            7. Propiedad intelectual
          </h2>
          <p>
            Todo el contenido del sitio, incluyendo textos, imágenes, logotipos y diseños, es
            propiedad de {{ storeName || 'nuestra tienda' }} o de terceros con licencia y está
            protegido por las leyes de propiedad intelectual aplicables.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            8. Limitación de responsabilidad
          </h2>
          <p>
            En la máxima medida permitida por la ley, no seremos responsables por daños indirectos,
            incidentales o consecuentes que resulten del uso de nuestros productos o servicios.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            9. Modificaciones
          </h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
            entrarán en vigor inmediatamente después de su publicación en el sitio.
          </p>
        </section>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            10. Contacto
          </h2>
          <p>
            Para consultas sobre estos términos, puede comunicarse con nuestro equipo de soporte
            a través de los canales oficiales disponibles en la tienda.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
