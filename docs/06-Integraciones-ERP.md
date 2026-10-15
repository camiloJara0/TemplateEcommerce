# 6 · Integraciones con sistemas de facturación y ERP

**CommerceOS — Requerimientos y plan de implementación**
Versión 1.0 · 09/10/2026 · Audiencia: PO, negocio, arquitecto y equipo de desarrollo

| Campo | Valor |
|---|---|
| Requerimiento principal | RF-054 · Integración con sistemas de facturación / ERP |
| Requerimiento relacionado | RF-055 · Autenticación federada con el sistema externo |
| Historias de usuario | HU-038 → HU-054 |
| Estado | 📋 Propuesto (pendiente de aprobación) |
| Prioridad | Alta |
| Fase de roadmap | Fase 2 · Crecimiento (habilitador de la Fase 4 · Ecosistema) |
| Dependencias técnicas | RF-031/RNF-17 (colas y reintentos), RF-046 (patrón de adaptadores) |

---

## Índice

0. [Contexto del proyecto](#0-contexto-del-proyecto)
1. [Objetivo del requerimiento](#1-objetivo-del-requerimiento)
2. [Alcance funcional](#2-alcance-funcional)
3. [Historias de usuario detalladas](#3-historias-de-usuario-detalladas)
4. [Requerimientos](#4-requerimientos)
5. [Reglas de negocio](#5-reglas-de-negocio)
6. [Riesgos y consideraciones](#6-riesgos-y-consideraciones)
7. [Plan de implementación](#7-plan-de-implementación)
8. [Anexo A · Ejemplo de normalización de datos](#8-anexo-a--ejemplo-de-normalización-de-datos)

---

## 0. Contexto del proyecto

CommerceOS es una plataforma de comercio electrónico tipo Shopify compuesta por:

- **Storefront** Nuxt 4 con constructor visual de páginas.
- **Panel administrativo** con 18 módulos (productos, inventario, pedidos, pagos, configuración…).
- **API REST** Laravel con 110 endpoints, 37 tablas, autenticación por token y permisos por rol.

Hoy el catálogo, el inventario y los pedidos se cargan y modifican **manualmente** desde el panel. Existen antecedentes de integración que este requerimiento reutiliza:

| Antecedente | Ubicación | Qué aporta |
|---|---|---|
| Adaptadores de pago plug-and-play | `template_back/config/payments.php` + `app/Services/Payment/*` | Lista de proveedores **definida en código** con `class_map` → misma lógica se usará para las APIs de facturación/ERP. |
| Credenciales cifradas en base de datos | `PaymentCredentialService.php` (guardar / obtener / probar / cargarEnConfig) | Patrón exacto a replicar con `IntegrationCredentialService`. |
| UI de proveedores con "Probar conexión" | `app/pages/admin/pagos.vue` | Experiencia de usuario a replicar en Configuración → Integración de API. |
| Registro de eventos externos | tabla `webhook_events` + pantalla `/admin/webhooks` | Estructura de historial y trazabilidad para eventos de sincronización. |
| Auditoría de acciones | tabla `audit_logs` (trait `LogsActivity`) | Auditoría automática de operaciones de integración. |
| Reintentos y colas (objetivo) | `RNF-17` (hoy 🔴) y store `offline.ts` con reintentos | Base sobre la que construir los reintentos de sincronización. |

> **Nota de numbering:** este documento propone **RF-054 / RF-055** (siguiendo la matriz del SRS que termina en RF-053) y **HU-038 → HU-054** (siguiendo el Plan Scrum que termina en HU-037). La numeración definitiva se confirma al aprobar el documento.

---

## 1. Objetivo del requerimiento

### 1.1 Problema de negocio

El cliente que ya opera con un sistema de facturación, un ERP o un software propio (inventario, punto de venta, contabilidad) debe **digitar dos veces** la misma información: registra productos, precios y existencias en su sistema, y vuelve a digitarlos en la tienda. Cuando algo cambia en un lado, el otro queda desactualizado.

Consecuencias observables hoy:

| # | Problema | Impacto para el cliente |
|---|---|---|
| P1 | Doble digitación de productos, precios y stock | Horas de trabajo administrativo repetitivo y costos de personal |
| P2 | Stock desincronizado entre sistemas | Venta de mercancía inexistente, anulaciones, malos reviews |
| P3 | Precios desactualizados en la tienda | Pérdida de margen o precios incorrectos al cliente final |
| P4 | Las compras/entradas de mercancía hechas en el ERP no llegan a la tienda | El inventario online no refleja lo que realmente se tiene |
| P5 | Las ventas de la tienda no llegan al sistema de facturación | Facturación incompleta, cierres contables manuales y riesgo fiscal |
| P6 | Dos conjuntos de credenciales (tienda y sistema externo) | Confusión, mayor superficie de soporte y recuperación de accesos |

### 1.2 Solución propuesta

Permitir que el cliente **conecte su sistema externo desde la configuración de la tienda**, de modo que:

1. Los productos, el inventario y las compras **se sincronicen automáticamente** entre ambos sistemas.
2. Las ventas de la tienda se **envíen** al sistema de facturación/ERP para su facturación.
3. El cliente pueda **iniciar sesión en la tienda con las mismas credenciales** de su sistema externo.
4. Todo lo que ocurra (éxito, error, reintento) quede **a la vista y registrado**.

### 1.3 Valor esperado

| Valor | Cómo se mide |
|---|---|
| Eliminación de digitación manual | Horas/mes ahorradas en carga de catálogo e inventario |
| Información consistente entre sistemas | Diferencia de stock/precio entre tienda y ERP = 0 tras cada sincronización |
| Menos errores operativos | Registros duplicados o ventas anuladas por stock inexistente → 0 |
| Facturación completa | % de ventas de la tienda reflejadas en el ERP |
| Mejor experiencia de adopción | Tiempo desde "crear integración" hasta "primera sincronización exitosa" < 15 minutos |
| Menor carga de soporte | Incidencias de "no coincide el stock" → tendencia a la baja |

### 1.4 Preguntas de negocio que este documento responde

1. ¿Qué debe poder hacer el cliente para conectar su sistema? (§2, §4)
2. ¿Qué reglas garantizan que los datos no se pisen ni se pierdan? (§5)
3. ¿Cómo queda la experiencia de login con credenciales externas? (§3 HU-052, §7.7)
4. ¿Qué tan complejo es construirlo y en cuántas fases? (§7)

---

## 2. Alcance funcional

### 2.1 Dentro del alcance (versión 1)

| # | Funcionalidad | Descripción en lenguaje de negocio |
|---|---|---|
| A1 | Registro de una integración | El cliente indica qué sistema va a conectar (entre los disponibles) y con qué nombre operativo quiere llamarlo. |
| A2 | Configuración de credenciales | Formulario con los datos de acceso que cada sistema exige (URL base, usuario, clave, clave de API…), guardados cifrados. |
| A3 | Validación de acceso | Botón **"Probar conexión"** que verifica de inmediato que el sistema externo responde con esas credenciales, antes de activar nada. |
| A4 | Importación inicial | Carga masiva de productos e inventario existentes en el sistema externo, para arrancar sin digitar. |
| A5 | Sincronización de productos | Alta, baja y actualización de productos (nombre, descripción, precio, categoría, marca, SKU, imágenes). |
| A6 | Sincronización de inventario | Existencias por producto y variante, en ambos sentidos según las reglas de dirección. |
| A7 | Sincronización de compras (bidireccional) | **Entrada:** compras/entradas de mercancía registradas en el ERP aumentan el stock de la tienda. **Salida:** ventas realizadas en la tienda se envían al ERP para facturar y descontar stock. |
| A8 | Sincronización manual bajo demanda | Botón "Sincronizar ahora" por módulo (productos, inventario, compras) o de todo. |
| A9 | Sincronización automática programada | Frecuencia configurable (cada 15 min, cada hora, diaria…). |
| A10 | Visualización del estado | Tablero con estado de cada integración: conectada / desconectada / con errores / última sincronización / pendientes. |
| A11 | Registro de errores y eventos | Historial consultable de cada ejecución: qué se hizo, cuántos registros, qué falló y por qué, con detalle del registro afectado. |
| A12 | Reintentos automáticos | Si una sincronización falla, se reintenta sola con espera creciente; si persiste, se avisa y se pausa. |
| A13 | Múltiples integraciones | El cliente puede conectar más de un sistema (ej. facturación + inventario propio) y gestionarlos de forma independiente. |
| A14 | Activar / desactivar | Pausar una sincronización sin borrar la configuración (útil en mantenimientos del sistema externo). |
| A15 | Login con credenciales del sistema externo | Si hay una integración con login habilitado, el inicio de sesión se valida primero contra el sistema externo y luego contra la tienda. |
| A16 | Mapeo y normalización de datos | Cada sistema nombra los campos a su manera; la plataforma traduce esos datos a su propio diseño antes de guardarlos. |
| A17 | Auditoría y trazabilidad | Quién conectó, quién sincronizó, qué cambió y cuándo, consultable desde el panel. |

### 2.2 Fuera de alcance (versión 1)

| # | Excluido | Justificación / cuándo sí |
|---|---|---|
| B1 | Conexión "a medida" solicitada por un cliente sin registrar en código | Solo se conectan APIs **registradas en el código** (ver §7.2). Personalizaciones = Fase 4 (marketplace de apps). |
| B2 | OAuth2 / OpenID Connect (redirección al proveedor) | La versión 1 usa credenciales directas (usuario/clave o API key). OAuth queda como evolución. |
| B3 | Webhooks entrantes desde el ERP (empuje de eventos) | Versión 1 es por consulta ("buscar cambios desde"). Webhooks = mejoras posteriores. |
| B4 | Sincronización de clientes, cupones, envíos y devoluciones | Candidatos a una segunda ola; se deja la arquitectura preparada. |
| B5 | Facturación electrónica (DIAN, etc.) | Sigue siendo RF-034 y depende del sistema externo. |
| B6 | Modificación de la lógica multi-tienda (SaaS) | RF-050 no existe; el diseño usa un identificador de integración para escalar luego. |
| B7 | Migración automática de pedidos históricos | Se sincroniza desde la activación en adelante (histórico opcional vía importación inicial). |

### 2.3 Actores involucrados

| Actor | Qué hace con esta funcionalidad |
|---|---|
| Administrador de tienda (A5) | Configura, prueba, activa, sincroniza y revisa. Permisos exclusivos. |
| Vendedor (A3) | Solo consulta el estado; no edita credenciales. |
| Cliente final (A2) | Usa el login federado sin percibir la integración (HU-052). |
| Proveedor del sistema externo (A7) | Depende de su disponibilidad, límites de uso y cambios de API. |
| Desarrollador | Registra nuevos proveedores en código, normalizadores y adaptadores. |

### 2.4 Dónde vive la funcionalidad en la APP

```
/admin/configuracion  →  sección "Integración de API"   (punto de entrada pedido)
        │
        ├─ Lista de sistemas disponibles (los registrados en código)
        ├─ Alta de integración + credenciales + "Probar conexión"
        └─ Atajo a la pantalla de operación

/admin/integraciones  →  pantalla de operación diaria
        ├─ Estado de cada integración (activa, pausada, con errores)
        ├─ Botones: Sincronizar ahora (productos / inventario / compras / todo)
        ├─ Últimas ejecuciones y resultados
        ├─ Historial de errores y eventos con detalle
        └─ Activar / desactivar / reconfigurar

/auth/login           →  comportamiento federado cuando hay integración con login (HU-052)
```

> **Decisión de diseño:** la *configuración* nace en Configuración de la tienda (requisito explícito del cliente), pero la *operación diaria* (estado, reintentos, historial) requiere pantalla propia porque tiene ciclos de uso muy distintos: se configura una vez y se consulta a diario. Ambas pantallas comparten el mismo servicio y datos.

---

## 3. Historias de usuario detalladas

> Formato **Como… Quiero… Para…** · Continúa la numeración del Plan Scrum (termina en HU-037).

### 3.1 Conexión y configuración

---

#### HU-038 · Registrar una integración con mi sistema de facturación

| | |
|---|---|
| **Como** administrador de tienda **quiero** conectar mi sistema de facturación, ERP o software propio desde la configuración de la tienda **para** que la información de mi negocio se mantenga sincronizada sin digitarla dos veces |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. En **Configuración → Integración de API** se listan los sistemas disponibles (los definidos en el código) con nombre, descripción y capacidades soportadas (productos / inventario / compras / login). 2. Al elegir un sistema se abre un formulario con **solo los campos de acceso que ese sistema exige**. 3. Se asigna un nombre propio a la integración para identificarla (ej. "Mi ERP contable"). 4. La integración nace en estado **inactiva**; nada se sincroniza hasta que se prueba y se activa. 5. Un integrante sin permisos no ve ni puede crear integraciones. 6. Se registra en auditoría quién la creó y cuándo. |
---

#### HU-039 · Configurar las credenciales de conexión

| | |
|---|---|
| **Como** administrador de tienda **quiero** guardar las credenciales de acceso a mi sistema externo **para** que la plataforma pueda hablar con él en cada sincronización |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Los campos se definen según el sistema elegido (ej. URL base + usuario + clave; o clave de API). 2. Las credenciales se guardan **cifradas** y **nunca** se muestran completas de vuelta: solo indicador "configurado" por campo. 3. Editar credenciales no detiene la integración ya existente hasta guardar. 4. Guardar exige permiso de edición; se audita el evento sin registrar los valores. 5. Validación de campos obligatorios y formato antes de guardar. |

---

#### HU-040 · Validar el acceso antes de activar

| | |
|---|---|
| **Como** administrador de tienda **quiero** probar la conexión con un clic **para** saber que el sistema externo responde correctamente antes de sincronizar datos |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Botón **"Probar conexión"** disponible tras guardar credenciales. 2. Respuesta clara: ✅ conectado (con mensaje del sistema externo) o ❌ no se pudo conectar (motivo comprensible: credenciales inválidas, sistema caído, sin permisos). 3. El test no modifica datos en ninguno de los dos sistemas. 4. Queda registrado en el historial de eventos con fecha, resultado y detalle. 5. Si el sistema externo tarda más del tiempo máximo permitido, se responde "tiempo de espera agotado" sin dejar la pantalla colgada. |

---

#### HU-041 · Importación inicial de datos

| | |
|---|---|
| **Como** administrador de tienda **quiero** importar de una sola vez los productos e inventario que ya existen en mi sistema externo **para** arrancar la tienda sin digitar el catálogo |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Acción "Importación inicial" disponible solo para integraciones conectadas y activas. 2. Muestra una vista previa: cuántos productos/inventarios se van a crear, actualizar o ignorar. 3. Procesa en lotes para no bloquear la pantalla; muestra progreso (X de Y). 4. Es **reanudable**: si se interrumpe, continúa donde quedó. 5. No duplica registros: un producto ya existente por SKU o por identificador externo se **actualiza**, no se crea de nuevo. 6. Al terminar, resumen final: creados / actualizados / omitidos / con error. 7. Puede ejecutarse más de una vez sin efectos secundarios (idempotente). |

---

### 3.2 Sincronización

---

#### HU-042 · Sincronizar productos

| | |
|---|---|
| **Como** administrador de tienda **quiero** sincronizar los productos entre mi sistema externo y la tienda **para** que nombres, descripciones, precios y categorías estén siempre actualizados |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Sincronización manual ("Sincronizar ahora") y automática. 2. Trae solo lo **modificado desde la última sincronización** (no el catálogo completo cada vez). 3. Crea productos nuevos, actualiza los existentes y marca como inactivos los dados de baja en el sistema externo (según regla de dirección). 4. Valida los datos mínimos obligatorios (nombre, SKU, precio); lo que no cumple queda en el historial como "requiere revisión" y **no** rompe la ejecución. 5. Resumen por ejecución: creados / actualizados / omitidos / con error. 6. Un error en un registro no detiene el resto. |

---

#### HU-043 · Sincronizar inventario

| | |
|---|---|
| **Como** administrador de tienda **quiero** que las existencias se sincronicen entre ambos sistemas **para** no vender mercancía que no tengo ni quedarme con stock viejo |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Sincroniza existencias por producto y por variante. 2. Cada cambio genera un **movimiento de inventario** trazable en la tienda (origen: integración, referencia a la ejecución). 3. La dirección de la verdad está configurable por integración (ver RN-09). 4. Nunca deja stock negativo por una sincronización; si el dato externo es inconsistente, marca el registro para revisión. 5. Compatible con las alertas de stock mínimas existentes. |

---

#### HU-044 · Recibir compras y entradas de mercancía desde el sistema externo

| | |
|---|---|
| **Como** administrador de tienda **quiero** que las compras registradas en mi ERP aumenten el inventario de la tienda **para** que lo que compro sea visible online de inmediato |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Las órdenes de compra/entrada creadas o modificadas en el sistema externo desde la última sincronización se reflejan en la tienda como **entrada de inventario**. 2. Cada compra se identifica por su número/ID externo: **no se registra dos veces** aunque se consulte varias veces. 3. Se guarda el número de compra, fecha, proveedor y detalle (producto, cantidad, costo) para consulta. 4. Si el producto de la compra no existe en la tienda, queda en el historial como pendiente de resolver (no crea productos huérfanos). 5. Resumen por ejecución con entradas aplicadas y pendientes. |

---

#### HU-045 · Enviar ventas de la tienda al sistema de facturación

| | |
|---|---|
| **Como** administrador de tienda **quiero** que cada venta realizada en la tienda se envíe a mi sistema de facturación/ERP **para** facturarla y descontar el stock en un solo lugar |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Un pedido pagado dispara el envío al sistema externo (inmediato o en la siguiente sincronización). 2. Se conserva el identificador devuelto por el sistema externo para poder consultarlo y reenviarlo. 3. **Sin duplicados**: reenviar un pedido ya aceptado no crea un registro doble en el ERP. 4. Estados visibles en el pedido de la tienda: pendiente de envío / enviado / aceptado / con error. 5. Los errores muestran el motivo del sistema externo y permiten **reintentar manualmente**. 6. Si el sistema externo está caído, el pedido queda en cola y se envía al recuperar (no se pierde). |

---

#### HU-046 · Sincronización automática programada

| | |
|---|---|
| **Como** administrador de tienda **quiero** elegir cada cuánto se sincroniza mi información **para** que todo se mantenga al día sin que yo tenga que acordarme |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Frecuencia configurable por integración: cada 15 min / cada hora / cada 6 h / diaria (y opción manual). 2. Cada ejecución queda registrada con inicio, fin, duración y resultado. 3. Dos ejecuciones del mismo tipo **no corren al mismo tiempo** (se evita el solape); si una sigue corriendo, la siguiente espera o se salta con aviso. 4. Si el sistema externo no responde, se aplican reintentos y la integración pasa a estado **con errores** sin detener las demás. 5. Un integrante puede pausar la programación sin borrar la configuración. 6. Al suspenderse por inactividad prolongada del sistema externo, se notifica a los administradores. |

---

### 3.3 Monitoreo, errores y gobernanza

---

#### HU-047 · Visualizar el estado de sincronización

| | |
|---|---|
| **Como** administrador de tienda **quiero** ver de un vistazo cómo está cada integración **para** saber si mi información está al día o hay que actuar |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Lista con: sistema, estado (activa / pausada / con errores / sin credenciales), última sincronización exitosa, próxima programada y resultados de la última ejecución. 2. Indicador de procesos en curso (con progreso). 3. Contador de errores pendientes del periodo. 4. Accesible desde Configuración → Integración de API y con entrada propia en el menú lateral del panel. 5. Sin datos sensibles a la vista (no muestra credenciales). |

---

#### HU-048 · Consultar el historial de errores y eventos

| | |
|---|---|
| **Como** administrador de tienda **quiero** ver qué hizo cada sincronización y qué falló **para** poder corregir el problema sin llamar a soporte |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Historial con filtros: integración, tipo (productos / inventario / compras / ventas / login / conexión), estado, fecha. 2. Cada evento muestra: fecha y hora, qué se intentó, cuántos registros afectados, resultado, mensaje del sistema externo y detalle técnico para el responsable técnico. 3. Errores de un registro individual identifican **cuál** (SKU o número de documento externo). 4. Paginación y retención configurable (mínimo 90 días). 5. Se pueden exportar los eventos filtrados. 6. Se audita quién consultó/exportó. |

---

#### HU-049 · Reintentos automáticos y aviso de fallos

| | |
|---|---|
| **Como** administrador de tienda **quiero** que la plataforma reintente sola cuando una sincronización falla y me avise si persiste **para** no perder información por un fallo momentáneo |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Fallo transitorio → reintento automático con espera creciente (ej. 1 min, 5 min, 15 min, 1 h) hasta un máximo de intentos configurable. 2. Errores que **no** se reintentran automáticamente (credenciales inválidas, datos corruptos) se reportan de inmediato. 3. Tras agotar los intentos, la integración queda **pausada por errores** y se notifica (in-app + email al administrador). 4. Un reintento manual reactiva la integración. 5. Cada intento queda registrado en el historial (intentos consecutivos agrupados). 6. El mismo evento nunca se reintenta para siempre (hay techo). |

---

#### HU-050 · Gestionar múltiples integraciones

| | |
|---|---|
| **Como** administrador de tienda **quiero** conectar más de un sistema (facturación, inventario propio, software a medida) **para** cubrir todas mis operaciones sin mezclarlas |
| **Épica** | Integraciones · **Prioridad** Media · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Se pueden crear varias integraciones (incluidas varias del mismo sistema) con nombre propio. 2. Cada una tiene su propio estado, credenciales, programación, historial y ejecuciones independientes. 3. La sincronización de una no afecta a las demás. 4. Si dos integraciones escriben sobre el mismo dato, aplica la regla de conflicto (RN-11) y se avisa en el historial. 5. Límite técnico documentado (máximo por tienda) con mensaje claro al superarlo. |

---

#### HU-051 · Activar o desactivar una integración

| | |
|---|---|
| **Como** administrador de tienda **quiero** pausar y reactivar una sincronización **para** mantener mi sistema externo en mantenimiento sin romper la tienda |
| **Épica** | Integraciones · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Interruptor activar/desactivar por integración. 2. Al **desactivar**: se detienen ejecuciones futuras y las programadas; lo que ya está en cola se conserva documentado. 3. Al **activar**: se reanuda la programación y se ofrece sincronizar lo pendiente (brecha acumulada). 4. La configuración y credenciales **no** se borran al desactivar. 5. Cambios auditados (quién, cuándo, de qué estado a cuál). 6. No se puede desactivar la integración desde el propio sistema externo; solo desde este panel. |

---

### 3.4 Autenticación federada

---

#### HU-052 · Iniciar sesión con las credenciales de mi sistema externo

| | |
|---|---|
| **Como** usuario de la tienda **quiero** usar el mismo usuario y contraseña de mi sistema de facturación o software propio para entrar **para** no manejar credenciales distintas ni duplicar usuarios |
| **Épica** | Integraciones / Autenticación · **Prioridad** Alta · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Si existe una **integración activa con login habilitado**, el inicio de sesión valida primero contra el sistema externo y luego crea la sesión en la tienda con el usuario correspondiente. 2. Si el usuario **no existe** en la tienda, se crea automáticamente con el rol que defina la integración (por defecto: administrador). 3. Si el sistema externo responde **"credenciales inválidas"** → se rechaza el acceso (401) y se registra el intento. 4. Si el sistema externo **no responde** (caído) → aplica la regla de contingencia (RN-14): login local de respaldo si está habilitado; si no, mensaje "servicio no disponible temporalmente". 5. Si **no hay integración con login**, el comportamiento actual no cambia (regresión cero). 6. El usuario no percibe la diferencia salvo un aviso opcional "Acceso validado con tu sistema". 7. El token de sesión, expiración y roles siguen funcionando igual que hoy. 8. El logout, recuperación de contraseña y cambios de contraseña locales quedan documentados como bypass (RN-15). |

---

#### HU-053 · Ajustar la traducción de campos y categorías entre sistemas

| | |
|---|---|
| **Como** administrador de tienda **quiero** poder ajustar cómo se traducen los datos de mi sistema a los de la tienda **para** que nombres de campos y categorías distintos no impidan sincronizar |
| **Épica** | Integraciones · **Prioridad** Media · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Cada proveedor soportado trae una **tabla de equivalencias por defecto** (ver Anexo A) definida en el código. 2. El panel permite mapear **categorías y estados** (ej. categoría externa "Hogar y muebles" → categoría de tienda "Hogar") sin tocar código. 3. Lo que no tenga equivalencia queda marcado con categoría "Sin asignar" y visible en el historial. 4. Cambios de mapeo se aplican en la siguiente sincronización y quedan auditados. 5. Un error de mapeo nunca detiene la ejecución completa. |

---

#### HU-054 · Ver quién cambió qué y cuándo (trazabilidad)

| | |
|---|---|
| **Como** administrador de tienda **quiero** poder rastrear el origen de cada cambio de precio o stock **para** resolver discrepancias con mi contador o proveedores |
| **Épica** | Integraciones · **Prioridad** Media · **Estado** 🔴 |
| **Criterios de aceptación** | 1. Todo cambio originado por una sincronización queda marcado con: integración, ejecución, fecha y usuario/sistema que lo originó. 2. Desde un producto o movimiento de inventario se puede llegar al evento que lo generó. 3. Los cambios manuales desde el panel quedan diferenciados de los automáticos. 4. La auditoría general de la plataforma (`audit_logs`) registra crear/editar/desactivar integraciones y ejecuciones manuales. 5. Exportación del historial de cambios por rango de fechas. |

---

### 3.5 Resumen de historias

| HU | Título | Épica | Prioridad |
|---|---|---|---|
| HU-038 | Registrar una integración | Conexión | Alta |
| HU-039 | Configurar credenciales | Conexión | Alta |
| HU-040 | Validar el acceso (probar conexión) | Conexión | Alta |
| HU-041 | Importación inicial | Sincronización | Alta |
| HU-042 | Sincronizar productos | Sincronización | Alta |
| HU-043 | Sincronizar inventario | Sincronización | Alta |
| HU-044 | Recibir compras desde el ERP | Sincronización | Alta |
| HU-045 | Enviar ventas al ERP | Sincronización | Alta |
| HU-046 | Sincronización automática programada | Sincronización | Alta |
| HU-047 | Visualizar estado | Monitoreo | Alta |
| HU-048 | Historial de errores y eventos | Monitoreo | Alta |
| HU-049 | Reintentos automáticos y avisos | Monitoreo | Alta |
| HU-050 | Múltiples integraciones | Gobernanza | Media |
| HU-051 | Activar / desactivar | Gobernanza | Alta |
| HU-052 | Login con credenciales externas | Autenticación | Alta |
| HU-053 | Mapeo de campos y categorías | Normalización | Media |
| HU-054 | Trazabilidad de cambios | Gobernanza | Media |

---

## 4. Requerimientos

Cada requerimiento incluye descripción funcional, criterios de aceptación y su traducción técnica. ID `REQ` nuevo; se indica el RF y las HU que cubre.

---

### REQ-01 · Registro de una integración externa

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-038 |
| **Prioridad** | Alta |
| **Descripción** | El administrador selecciona un sistema disponible (entre los registrados en el código), le asigna un nombre propio y completa los datos de acceso. |

**Criterios de aceptación**
1. Lista de sistemas disponibles obtenida del servidor (no digitada por el usuario): nombre, descripción, capacidades soportadas y campos requeridos.
2. Campos del formulario generados a partir de la definición del proveedor (obligatorios, tipo de dato, ayuda).
3. Validación en servidor de todos los campos antes de crear.
4. Nombre propio único por integración; identificador externo de sistema repetible.
5. Estado inicial `inactiva`.
6. Auditoría de creación.

**Traducción técnica**
- Alta de proveedores en `config/integrations.php` con `providers` (campos, etiquetas, capacidades, `supports_login`) + `class_map` → `app/Services/Integration/*` (patrón idéntico a `config/payments.php`).
- Tabla nueva `integrations`.
- Endpoints `GET /admin/integraciones/sistemas-disponibles` y `POST /admin/integraciones`.
- Permisos nuevos: `integraciones.ver`, `integraciones.editar`, `integraciones.sincronizar`.

---

### REQ-02 · Configuración de credenciales de conexión

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-039 |
| **Prioridad** | Alta |
| **Descripción** | Almacenar de forma segura los datos de acceso al sistema externo. |

**Criterios de aceptación**
1. Cifrado en reposo (patrón `PaymentCredentialService` → `Crypt`, grupo `integraciones` en `settings` o tabla propia).
2. Nunca se devuelven valores sensibles en respuestas API: solo `configurado: true/false` por campo.
3. Auditoría de modificación **sin** registrar valores.
4. Sobrescritura parcial permitida (reenviar solo un campo no borra los demás).
5. Carga de credenciales a configuración en runtime al iniciar (`cargarEnConfig` equivalente).

---

### REQ-03 · Validación de acceso al sistema externo

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-040 |
| **Prioridad** | Alta |
| **Descripción** | Comprobar de inmediato que la conexión funciona. |

**Criterios de aceptación**
1. Endpoint `POST /admin/integraciones/{id}/probar` invoca al adaptador (`probarConexion()`).
2. Clasificación de la respuesta: `ok` / `credenciales_invalidas` / `no_disponible` / `tiempo_agotado` / `sin_permisos`.
3. Timeout máximo configurable (default 15 s).
4. No escribe datos de negocio en ningún sistema.
5. Resultado persistido en el historial de eventos.
6. Respuesta < 5 s en condiciones normales.

---

### REQ-04 · Sincronización de productos

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-042 |
| **Prioridad** | Alta |
| **Descripción** | Traer/empujar productos según la dirección configurada, con normalización al modelo propio. |

**Criterios de aceptación**
1. Dirección configurable: `entrante` (externo → tienda), `saliente` (tienda → externo) o `bidireccional` con regla por campo (RN-09).
2. Detección de cambios por fecha de última modificación (`updated_at` externo) y por `external_id`.
3. Upsert por clave natural: `sku` + `external_id` (nunca duplica).
4. Validación con las reglas propias del modelo (`name`, `sku` único, `price ≥ 0`); inválidos → evento de error con detalle, sin detener la ejecución.
5. Creación automática de categorías/marcas si no existen (o mapeo según HU-053).
6. Bajas en el externo → `estado = inactivo` (soft delete, no borrado físico).
7. Imágenes: descarga opcional con límite de tamaño y cantidad por producto (evitar bloquear la ejecución).
8. Resumen: `creados / actualizados / omitidos / errores`.

---

### REQ-05 · Sincronización de inventario

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-043 |
| **Prioridad** | Alta |
| **Descripción** | Sincronizar existencias por producto y variante. |

**Criterios de aceptación**
1. Acepta productos con y sin variantes.
2. Cada aplicación genera `stock_movements` con `tipo` y `razon = 'sincronizacion'` + referencia a la ejecución (`referencia` morph).
3. Nunca deja stock negativo (RN-10).
4. Respeta `stock_alerts` existentes.
5. Procesa por lotes (default 100 registros) para no saturar la base.
6. Reporte de diferencias detectadas (opcional, para auditoría de arranque).

---

### REQ-06 · Sincronización de compras (bidireccional)

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-044 + HU-045 |
| **Prioridad** | Alta |
| **Descripción** | **Entrada:** compras/entradas del ERP → inventario de la tienda. **Salida:** ventas de la tienda → sistema de facturación. |

**Criterios de aceptación — entrada**
1. Consulta de compras creadas/modificadas desde `ultimo_sincronizado`.
2. Idempotencia por número/ID de compra externo (tabla de documentos externos).
3. Aplica entrada de stock y registra el documento (número, fecha, proveedor, líneas).
4. Producto inexistente → pendiente de resolución, no bloquea.

**Criterios de aceptación — salida**
1. Disparo al confirmar el pago del pedido y/o en la siguiente sincronización.
2. Mapeo pedido → documento externo con moneda, impuestos y líneas normalizadas.
3. Guarda el ID devuelto por el externo; reintento sin duplicar.
4. Estados en el pedido: `pendiente_envio / enviado / aceptado / error`.
5. Reintento manual desde la ficha del pedido y desde el historial.
6. Cola persistente: si el externo está caído, se conserva y envía al recuperar (RN-16).

---

### REQ-07 · Importación inicial de datos

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-041 |
| **Prioridad** | Alta |
| **Descripción** | Carga masiva de arranque con vista previa y reanudación. |

**Criterios de aceptación**
1. Vista previa (conteos por operación) antes de ejecutar.
2. Ejecución por lotes con progreso consultable (`X de Y`).
3. Reanudable desde el último lote procesado.
4. Idempotente: repetir no duplica.
5. Resumen final y detalle de errores exportable.
6. Exclusión mutua con una sincronización normal en curso (RN-07).

---

### REQ-08 · Sincronización manual bajo demanda

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-042/043/044/045 |
| **Prioridad** | Alta |
| **Descripción** | Botón "Sincronizar ahora" por alcance (productos, inventario, compras, ventas, todo). |

**Criterios de aceptación**
1. Solo disponible con integración activa y credenciales configuradas.
2. Devuelve inmediatamente el ID de la ejecución (no bloquea el navegador).
3. Un aviso muestra el progreso y el resultado.
4. Si ya hay una ejecución del mismo alcance en curso → mensaje "ya hay una sincronización en proceso" (sin doble ejecución).
5. Auditado con el usuario que lo solicitó.

---

### REQ-09 · Sincronización automática programada

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-046 |
| **Prioridad** | Alta |
| **Descripción** | Ejecución periódica configurable por integración. |

**Criterios de aceptación**
1. Frecuencias: 15 min, 1 h, 6 h, diaria, o desactivada.
2. Ejecutada por el planificador del servidor (`schedule` → comando `integrations:sync`), con bloqueo por integración (`withoutOverlapping`).
3. Registra `iniciada / finalizada / fallida` con duración y contadores.
4. Fallo → reintentos (REQ-12) y degradación del estado sin afectar a otras integraciones.
5. Cambios de programación auditados.

> **Dependencia:** hoy el planificador solo tiene `audit:purge` y el entorno corre con `QUEUE_CONNECTION=sync` (RNF-01). Ver §7.8 y Riesgo R-02.

---

### REQ-10 · Visualización del estado de sincronización

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-047 |
| **Prioridad** | Alta |
| **Descripción** | Pantalla de estado por integración y resumen global. |

**Criterios de aceptación**
1. Estados posibles: `sin_credenciales`, `inactiva`, `activa`, `sincronizando`, `con_errores`, `pausada_por_errores`.
2. Muestra: última ejecución exitosa (fecha/hora), próxima ejecución, resultados de la última (creados/actualizados/errores) y errores pendientes.
3. Actualizable sin recargar toda la página (consulta periódica o al volver de una ejecución).
4. Accesible desde Configuración → Integración de API y desde el menú lateral.
5. Sin información sensible.

---

### REQ-11 · Registro de errores y eventos

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-048 |
| **Prioridad** | Alta |
| **Descripción** | Bitácora de cada ejecución y de cada evento (conexión, login, error). |

**Criterios de aceptación**
1. Tabla de ejecuciones (cabecera) + tabla de eventos/errores (detalle por registro).
2. Cada evento: fecha, tipo, severidad (`info / warning / error`), mensaje normalizado, mensaje crudo del sistema externo, payload resumido, referencia al registro afectado (SKU, ID externo, número de documento), ejecución a la que pertenece.
3. Filtros: integración, tipo, severidad, rango de fechas; paginación.
4. Retención configurable (mín. 90 días) con purga automática.
5. Exportación CSV de lo filtrado.
6. Nunca almacena credenciales ni tokens en claro en los mensajes.

---

### REQ-12 · Reintentos automáticos ante fallas

| Campo | Valor |
|---|---|
| **RF / HU** | RF-049 · HU-049 (vinculado a RF-054) |
| **Prioridad** | Alta |
| **Descripción** | Recuperación automática ante fallos transitorios y freno ante fallos permanentes. |

**Criterios de aceptación**
1. Política de espera creciente: 1 min → 5 min → 15 min → 1 h (máx. 4 reintentos, configurable).
2. Clasificación del error: **transitorio** (red, timeout, 5xx, 429) → reintenta; **permanente** (401, 403, validación) → no reintenta, notifica.
3. Tras agotar intentos → integración `pausada_por_errores` + notificación in-app y email.
4. Límite global de intentos por evento (nunca en bucle infinito).
5. Cada intento se registra agrupado al evento original.
6. Reintento manual disponible para el administrador.

---

### REQ-13 · Gestión de múltiples integraciones por cliente

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-050 |
| **Prioridad** | Media |
| **Descripción** | Vivas integraciones coexistentes e independientes. |

**Criterios de aceptación**
1. Tabla con múltiples filas por tienda; nombre propio único.
2. Aislamiento: credenciales, programación, ejecuciones e historial independientes.
3. Fila simultánea permitida; se evita solape solo dentro de la misma integración.
4. Límite recomendado documentado (p. ej. 5 por tienda) con mensaje al superarlo.
5. Si dos integraciones escriben el mismo dato → se aplica RN-11 y se deja el aviso.

---

### REQ-14 · Activar o desactivar integraciones

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-051 |
| **Prioridad** | Alta |
| **Descripción** | Pausa y reanudación sin pérdida de configuración. |

**Criterios de aceptación**
1. Interruptor por integración con confirmación.
2. Desactivar detiene programaciones nuevas y el envío automático de ventas; no borra datos ni credenciales.
3. Activar ofrece sincronizar la brecha acumulada (desde `ultimo_sincronizado`).
4. Auditoría del cambio de estado.
5. El estado visible en REQ-10 refleja el cambio de inmediato.

---

### REQ-15 · Autenticación federada con el sistema externo

| Campo | Valor |
|---|---|
| **RF / HU** | RF-055 · HU-052 |
| **Prioridad** | Alta |
| **Descripción** | Validar primero contra el sistema externo cuando hay una integración con login habilitado. |

**Criterios de aceptación**
1. En `POST /v1/login`, si existe integración activa con `soporta_login = true` → se ejecuta `loginFederado()` **antes** del login local.
2. Éxito externo → usuario local mapeado por email o identificador externo; si no existe, se crea con el rol configurado (default `cliente`).
3. Credenciales inválidas en el externo → 401 y evento registrado (no se intenta el login local).
4. Sistema externo caído → contingencia configurable por integración (RN-14): local de respaldo o rechazo con mensaje de indisponibilidad.
5. Sin integración con login → comportamiento idéntico al actual (regresión cero, cubierto por tests existentes `AuthTest`).
6. El usuario recibe indicador opcional de acceso federado.
7. Tokens Sanctum, expiración (16 h), throttling (10/min) y redirección por rol se mantienen.
8. Eventos de login federado (éxito/fallo) auditados.

**Traducción técnica**
- `AuthFederationService` (o `IntegrationAuthenticator`) que delega en `IntegrationProvider::login($usuario, $clave)`.
- Interfaz de proveedor con método `login()` (obligatorio solo si `soporta_login`).
- Endpoint público opcional `GET /v1/login/integracion` (¿la tienda usa acceso federado?) para pintar el aviso en el formulario sin adivinar.

---

### REQ-16 · Normalización de datos entre sistemas

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-053 |
| **Prioridad** | Alta |
| **Descripción** | Traducir el JSON propio de cada proveedor al diseño de datos de CommerceOS. |

**Criterios de aceptación**
1. Cada proveedor declara su **adaptador de normalización** por dominio (producto, inventario, compra, venta).
2. El adaptador recibe el JSON crudo y devuelve el payload normalizado listo para persistir contra `products`, `product_variants`, `stock_movements`, documentos externos, etc.
3. El JSON crudo de cada ejecución se conserva **muestreado** (primeros N registros o en caso de error) para depurar sin ahorrar storage.
4. Reglas de conversión documentadas: moneda/decimales, fechas (timezone), estados/mapeo de catálogos, imágenes, variantes.
5. Un cambio en el contrato del proveedor se aísla en su adaptador (el resto del sistema no cambia).
6. Mapeo de categorías/estados configurable desde la UI (HU-053).

---

### REQ-17 · Auditoría y trazabilidad de operaciones

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-054 |
| **Prioridad** | Media |
| **Descripción** | Quién hizo qué, cuándo y con qué resultado. |

**Criterios de aceptación**
1. `audit_logs` registra: crear/editar/probar/activar/desactivar/sincronizar/borrar integraciones y exportaciones del historial.
2. Cada cambio de negocio originado por sincronización lleva referencia a la ejecución (y por extensión a la integración y fecha).
3. Se distingue origen: `manual` vs `integracion`.
4. Desde la ficha de un producto o movimiento de inventario se llega al evento que lo generó.
5. Exportación por rango de fechas.

---

### REQ-18 · Notificaciones de estado

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · HU-049 |
| **Prioridad** | Media |
| **Descripción** | Avisar a los administradores cuando algo requiere atención. |

**Criterios de aceptación**
1. Canales: notificación in-app (existente) + email (SMTP ya configurado).
2. Eventos que notifican: integración pausada por errores, credenciales inválidas, importación inicial finalizada, login federado con fallo repetido.
3. Sin spam: máximo 1 aviso por evento agrupado en una ventana configurable.
4. Preferencia de aviso por integración (activar/desactivar).

---

### REQ-19 · Permisos y roles

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 (todas) |
| **Prioridad** | Alta |
| **Descripción** | Control de acceso acorde a la sensibilidad de las credenciales. |

**Criterios de aceptación**
1. Nuevos permisos en `config/permissions.php`: `integraciones.ver`, `integraciones.editar`, `integraciones.sincronizar`, `integraciones.historial`.
2. Solo rol **admin** los recibe por defecto (`*`); vendedor y operador quedan fuera (o solo `ver`).
3. Cada endpoint admin exige el permiso mediante el middleware `EnsurePermission` existente.
4. Sin permiso → 403 tipado (patrón actual).
5. El login federado no exige sesión previa (es un endpoint público sujeto a throttle).

---

### REQ-20 · Disponibilidad y degradación elegante

| Campo | Valor |
|---|---|
| **RF / HU** | RF-054 · RNF-03 |
| **Prioridad** | Alta |
| **Descripción** | Una integración caída nunca debe impedir operar la tienda. |

**Criterios de aceptación**
1. Ninguna operación del storefront (catálogo, carrito, checkout) depende de la respuesta del sistema externo.
2. Si el externo está caído: la tienda sigue vendiendo; las ventas quedan en cola (REQ-06) y el estado se muestra como `con_errores`.
3. Timeout corto y configurable en cada llamada externa.
4. Circuit breaker simple: tras N fallos consecutivos, se deja de llamar por un periodo de enfriamiento (evita castigar al proveedor caído).

---

## 5. Reglas de negocio

### 5.1 Seguridad de credenciales

| ID | Regla |
|---|---|
| RN-01 | Las credenciales se guardan **cifradas** en reposo y jamás se devuelven en respuestas API ni se muestran en pantalla (solo indicador "configurado"). |
| RN-02 | Verlas, editarlas o borrarlas exige permiso `integraciones.editar` y rol administrador; cada acción queda auditada **sin** registrar los valores. |
| RN-03 | Las credenciales no aparecen en logs, mensajes de error ni notificaciones. Si un error del proveedor las incluye, se enmascaran antes de persistir. |
| RN-04 | Las llamadas al sistema externo salen siempre por HTTPS. Si la URL configurada es insegura y el entorno es producción → bloqueo con aviso. |
| RN-05 | Rotación de credenciales sin pérdida: editarlas no reinicia contadores de sincronización ni borra el historial. |
| RN-06 | Las credenciales se usan solo desde el servidor; el navegador nunca las recibe de vuelta. |

### 5.2 Disponibilidad del servicio

| ID | Regla |
|---|---|
| RN-07 | La indisponibilidad del sistema externo **nunca** bloquea el storefront ni la operación interna de la tienda. |
| RN-08 | Solo corre **una** ejecución simultánea por integración; nunca dos procesos compiten por los mismos datos. |
| RN-09 | Toda llamada externa tiene tiempo máximo de espera (default 15 s; lecturas por lotes 30 s). Al superarlo: error `tiempo_agotado` y política de reintentos. |
| RN-10 | La tienda nunca queda con stock negativo por efecto de una sincronización; valores inconsistentes del externo se marcan para revisión en lugar de aplicarse. |
| RN-11 | **Conflicto de fuentes:** la dirección de verdad es configurable por dominio (productos / inventario / compras). En modo bidireccional gana el **último cambio por fecha-hora**, con desempate a favor del sistema externo; si dos integraciones escriben sobre el mismo registro, gana la de mayor prioridad configurada y se deja el aviso en el historial. |
| RN-12 | Regla de no borrado: la sincronización **no borra** productos ni documentos; solo da de baja (estado inactivo) o deja pendiente. Los borrados son acción manual. |

### 5.3 Rendimiento de sincronización

| ID | Regla |
|---|---|
| RN-13 | Procesamiento por **lotes** (default 100 registros) con paginación contra el proveedor; nunca catálogos completos en una sola llamada. |
| RN-14 | Incremental por defecto: solo se pide lo modificado desde `ultimo_sincronizado`; la importación completa es una acción explícita (REQ-07). |
| RN-15 | La ejecución no bloquea la navegación del panel: se dispara, se informa progreso y se consulta el resultado. |
| RN-16 | Máximos configurables por ejecución: registros leídos, duración total y llamadas al proveedor; al alcanzarlos, se finaliza "parcialmente" y continúa en la siguiente. |
| RN-17 | Escrituras en la base agrupadas por lote; se evitan N+1 y se reutilizan las cargas (`with()`) existentes en los modelos. |

### 5.4 Escalabilidad

| ID | Regla |
|---|---|
| RN-18 | El registro de proveedores en código permite sumar sistemas **sin tocar** el núcleo: agregar entrada en `config/integrations.php`, clase de adaptador y normalizador. |
| RN-19 | El número de integraciones por tienda es configurable; el diseño de tablas usa siempre `integration_id` para soportar multi-integración y futuro multi-tienda (RF-050). |
| RN-20 | Las sincronizaciones se ejecutan fuera del ciclo de respuesta HTTP (comando programado +, en fases posteriores, cola con Redis) para absorber picos. |
| RN-21 | Un proveedor lento o caído degrada **solo su integración**; el resto sigue operando. |

### 5.5 Auditoría de operaciones

| ID | Regla |
|---|---|
| RN-22 | Crear, editar, probar, activar, desactivar, sincronizar y eliminar integraciones quedan en `audit_logs` con usuario, IP y fecha. |
| RN-23 | Toda ejecución de sincronización genera una fila de ejecución con: inicio, fin, duración, tipo, resultado, contadores y usuario que la disparó (o `programada`). |
| RN-24 | Los cambios de credenciales se auditan por evento, no por valor. |

### 5.6 Trazabilidad de cambios

| ID | Regla |
|---|---|
| RN-25 | Todo dato originado por integración guarda: `integration_id`, `sync_run_id`, fecha y `external_id`. |
| RN-26 | Se distingue el origen de cada cambio (`manual` vs `integracion`) en productos, inventario y pedidos. |
| RN-27 | Los documentos externos (compras, ventas enviadas) conservan su identificador original y el devuelto por el proveedor para permitir cruzar información con el sistema externo. |
| RN-28 | El historial de eventos conserva el payload crudo **muestreado** para depuración (retención según REQ-11). |

### 5.7 Manejo de errores

| ID | Regla |
|---|---|
| RN-29 | Clasificación obligatoria de cada error: `transitorio` (reintenta) o `permanente` (no reintenta, notifica). |
| RN-30 | Un error de un registro **nunca** aborta la ejecución completa; se acumula y se reporta al finalizar. |
| RN-31 | Reintentos con espera creciente y techo de intentos (REQ-12); jamás bucle infinito. |
| RN-32 | Mensajes visibles al administrador en lenguaje comprensible + detalle técnico expandible para el responsable técnico. |
| RN-33 | Idempotencia en todas las operaciones repetibles: repetir una sincronización o reintento no crea duplicados (claves externas únicas). |
| RN-34 | Errores permanentes por credenciales → la integración pasa a `pausada_por_errores` y exige acción humana. |

### 5.8 Monitoreo

| ID | Regla |
|---|---|
| RN-35 | Estado consultable en todo momento (REQ-10) y actualizable sin recargar el panel completo. |
| RN-36 | Indicadores mínimos por integración: última ejecución exitosa, tasa de éxito (30 días), registros sincronizados, errores pendientes, tiempo medio de ejecución. |
| RN-37 | Alertas (in-app + email) ante: pausa por errores, credenciales inválidas, N fallos consecutivos y silencio prolongado (la programada no corre). |
| RN-38 | Los eventos se exportan para análisis externo. |
| RN-39 | La bitácora de sincronización no sustituye a los logs operativos del servidor: ambos coexisten. |

---

## 6. Riesgos y consideraciones

### 6.1 Riesgos

| ID | Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|---|
| R-01 | La API del proveedor cambia su contrato (formato JSON, versiones) | Alto | Alta | Adaptadores aislados por proveedor (REQ-16), muestreo de payloads, pruebas de contrato con fixtures, versión de proveedor declarada en `config/integrations.php`. |
| R-02 | **Infraestructura de trabajo diferido no activa** (`QUEUE_CONNECTION=sync`, cron no documentado en el repo) | Alto | Alta | Fase 0 incluye habilitar planificador + comando; si no hay cola, ejecutar por lotes en comando con tiempos acotados y `withoutOverlapping`. Ver RNF-01/RNF-17. |
| R-03 | Limitaciones de uso (rate limits) o latencia del proveedor | Medio | Alta | Lotes pequeños, espera ante 429 con reintento, respeto a `Retry-After`, ventana horaria configurable. |
| R-04 | Conflictos de verdad entre sistemas (quién manda) | Alto | Media | RN-11 con dirección por dominio, mapeo visible, historial de cambios y modo inicial recomendado "externo manda". |
| R-05 | Duplicados de productos o documentos por claves mal mapeadas | Alto | Media | Upsert por `sku` + `external_id`, unicidad en tablas de documentos externos, importación con vista previa, pruebas de idempotencia. |
| R-06 | Datos sucios del proveedor (precios negativos, campos vacíos, fechas raras) | Medio | Alta | Validación antes de persistir, evento "requiere revisión" sin abortar, normalización con valores por defecto documentados. |
| R-07 | Login federado rompe el acceso existente | Alto | Media | Flag por integración (default apagado), regresión cero con `AuthTest`, contingencia configurable (RN-14 desviada), despliegue con periodo de observación. |
| R-08 | Fuga o exposición de credenciales | Crítico | Media | Cifrado en reposo, sin devolución ni logs, permisos estrictos, auditoría (REQ-02/RN-01..06); además, revisar previamente la deuda conocida de secretos en git (SRS §Deuda 1). |
| R-09 | Dependencia de terceros indisponible (caída prolongada) | Alto | Media | Degradación elegante (REQ-20), cola de ventas pendientes, alertas, pausa por errores, documentar SLA del proveedor. |
| R-10 | Rendimiento de la base por volúmenes grandes en importación inicial | Medio | Media | Lotes, transacciones por lote, ejecución en segundo plano, índice por `external_id`, medición previa con catálogo de prueba. |
| R-11 | Alcance disperso por la variedad de sistemas (cada ERP es distinto) | Alto | Alta | Alcance v1 = **solo proveedores registrados en código**; plantilla de adaptador + normalizador; un segundo proveedor real como prueba de la abstracción. |
| R-12 | Esfuerzo subestimado en normalización (el 60% del trabajo real) | Alto | Alta | Fase dedicada, fixtures JSON por proveedor, tabla de equivalencias documentada (Anexo A), buffer de +30% en estimaciones. |
| R-13 | Sin pruebas automatizadas de integración (hoy sin mocks de terceros) | Medio | Alta | Capa de cliente HTTP fake con fixtures, tests unitarios de normalizadores, suite E2E mínima de sincronización. |
| R-14 | Permisos mal configurados exponen credenciales a roles no admin | Alto | Baja | Middleware `EnsurePermission` en cada ruta, tests de autorización 403, revisión de `config/permissions.php`. |
| R-15 | Deuda técnica previa contamina la funcionalidad (endpoints sin permiso, CORS `*`, tests fallando 8) | Medio | Alta | Corregir en Fase 0 los puntos que afecten a las nuevas rutas; no arrastrar patrones defectuosos. |

### 6.2 Dependencias

| # | Dependencia | Estado hoy | Acción requerida |
|---|---|---|---|
| D-1 | Patrón de proveedores en código (`config/payments.php` + adaptadores) | ✅ Existe | Replicar para integraciones |
| D-2 | Servicio de credenciales cifradas | ✅ Existe (`PaymentCredentialService`) | Crear `IntegrationCredentialService` equivalente |
| D-3 | Auditoría automática | ✅ Existe (`LogsActivity`) | Asegurar eventos clave en `audit_logs` |
| D-4 | Permisos por rol | ✅ Existe (`EnsurePermission`) | Agregar `integraciones.*` |
| D-5 | Planificador (cron) | 🟡 Solo `audit:purge` | Agregar `integrations:sync` + documentar `schedule:run` |
| D-6 | Colas | 🔴 `QUEUE_CONNECTION=sync` | Evaluar Redis en Fase 4 (o ejecución por lotes en comando) |
| D-7 | Notificaciones in-app + email | 🟡 Base existe | Componer avisos de integración (REQ-18) |
| D-8 | Historial de eventos externos | 🟡 `webhook_events` como precedente | Nuevo modelo de ejecuciones/eventos |
| D-9 | Segundo proveedor real de prueba | 🔴 No definido | Definir con negocio cuál será el primero (además del principal) |

### 6.3 Limitaciones conocidas

1. **Un solo proveedor a la vez por login:** la versión 1 valida contra la integración con login habilitado (una por tienda).
2. **Sin webhooks entrantes:** los cambios del ERP se detectan por consulta, con la latencia de la programación (mínima 15 min salvo sincronización manual).
3. **Sin personalización de transformaciones desde la UI:** los cálculos viven en el adaptador; la UI solo mapea catálogos (HU-053).
4. **Histórico:** solo se sincroniza lo generado desde la activación (salvo importación inicial explícita).
5. **Mono-tienda:** el diseño usa `integration_id` para escalar, pero hoy no hay aislamiento multi-tenant.

---

## 7. Plan de implementación

### 7.1 Diseño funcional de alto nivel

```
                       ┌───────────────────────────────┐
                       │        PANEL (Nuxt 4)         │
                       │  /admin/configuracion         │
                       │    └─ Integración de API      │
                       │  /admin/integraciones         │
                       │    ├─ estado · sincronizar    │
                       │    └─ historial · errores     │
                       └──────────────┬────────────────┘
                                      │ API REST /admin/integraciones/*
                       ┌──────────────▼────────────────┐
                       │   BACKEND (Laravel)           │
                       │  IntegrationController        │
                       │  SyncService ─ ejecuciones    │
                       │  Normalizer ── traducción     │
                       │  CredentialService ─ cifrado  │
                       │  AuthFederationService ─ login│
                       │  integrations:sync (cron)     │
                       └──────────────┬────────────────┘
                                      │ HTTPS (JSON)
                       ┌──────────────▼────────────────┐
                       │  REGISTRO EN CÓDIGO           │
                       │  config/integrations.php      │
                       │   providers[] + class_map     │
                       │  app/Services/Integration/*   │
                       └──────────────┬────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
       [Proveedor A]           [Proveedor B]           [Proveedor C]
       facturación/ERP         software propio         futuro (alta en código)
```

**Flujo de una sincronización**

1. Disparo: botón (manual), cron (automática) o evento (pago confirmado → envío de venta).
2. Se crea la **ejecución** (`iniciando`) y se bloquea para esa integración.
3. El adaptador del proveedor **lee** en lotes desde `ultimo_sincronizado`.
4. El **normalizador** traduce cada registro al modelo propio.
5. Se **persiste** en transacción por lote (upsert por claves externas).
6. Se acumulan contadores y errores; se actualiza `ultimo_sincronizado`.
7. La ejecución finaliza (`exitosa` / `parcial` / `fallida`) y aplica la política de reintentos.
8. Se notifica si corresponde y se registra en auditoría.

### 7.2 Registro de proveedores en código (patrón ServicesPayment)

Se replica la arquitectura que hoy usan los pagos (`config/payments.php` + `PaymentCredentialService` + `app/Services/Payment/*`):

```php
// config/integrations.php  (nuevo)
return [
    'providers' => [
        'erp_facturacion_x' => [
            'label'          => 'ERP Facturación X',
            'description'    => 'Sincroniza productos, inventario, compras y ventas.',
            'capabilities'   => ['productos', 'inventario', 'compras', 'ventas', 'login'],
            'fields' => [   // define el formulario de credenciales
                'base_url' => ['label' => 'URL del sistema', 'type' => 'url', 'required' => true],
                'usuario'  => ['label' => 'Usuario', 'type' => 'text', 'required' => true],
                'clave'    => ['label' => 'Contraseña', 'type' => 'password', 'required' => true],
            ],
            'supports_login' => true,
            'login_user_field' => 'email',
            'version'       => 'v1',
        ],
        // ... más proveedores registrados aquí
    ],
    'class_map' => [
        'erp_facturacion_x' => \App\Services\Integration\ErpFacturacionXProvider::class,
    ],
    'sync' => [
        'batch_size'      => 100,
        'timeout'         => 15,
        'max_attempts'    => 4,
        'backoff'         => [60, 300, 900, 3600], // segundos
        'max_per_run'     => 5000,
    ],
];
```

**Contrato del adaptador** (`app/Services/Integration/IntegrationProvider.php`)

| Método | Propósito | Obligatorio |
|---|---|---|
| `probarConexion(): array` | Valida acceso (REQ-03) | Sí |
| `login(string $u, string $p): array` | Autenticación externa (REQ-15) | Solo si `supports_login` |
| `obtenerProductos(string $desde, int $page): array` | Lectura incremental | Según capability |
| `obtenerInventario(string $desde, int $page): array` | Lectura incremental | Según capability |
| `obtenerCompras(string $desde, int $page): array` | Entradas desde el ERP | Según capability |
| `crearVenta(array $pedido): array` | Envío de venta (retorno `external_id`) | Según capability |
| `normalizar(string $tipo, array $payload): array` | Traducción al modelo propio | Sí |
| `describirErrores(Throwable $e): array` | Clasifica transitorio/permanente | Sí |

Cada proveedor = **una clase de adaptador** + **un normalizador** + **fixtures JSON de prueba**. Alta de un nuevo sistema = registrar en `config/integrations.php` (campos + `class_map`), sin tocar controllers ni UI (el formulario se genera desde `fields`).

### 7.3 Modelo de datos (nuevas tablas)

| Tabla | Propósito | Campos clave |
|---|---|---|
| `integrations` | Configuración de cada conexión | `id`, `nombre` (propio), `provider` (clave en código), `estado`, `soporta_login`, `rol_login_federado`, `credenciales` (cifradas), `config_sincronizacion` (JSON: frecuencia, dirección por dominio, lotes), `ultimo_sincronizado`, `ultimo_estado`, `intentos_fallo`, `activa`, `timestamps` |
| `integration_sync_runs` | Cabecera de cada ejecución | `id`, `integration_id`, `tipo` (`productos/inventario/compras/ventas/inicial/todo`), `origen` (`manual/programada/evento`), `estado`, `iniciado_en`, `finalizado_en`, `procesados/creados/actualizados/omitidos/errores`, `usuario_id`, `resumen` |
| `integration_events` | Errores y eventos (REQ-11) | `id`, `integration_id`, `sync_run_id`, `tipo`, `severidad`, `mensaje`, `mensaje_externo`, `referencia` (SKU / ID externo / nº documento), `payload` (JSON muestreado), `intentos`, `reintentado_en`, `created_at` |
| `integration_records` | Mapeo y trazabilidad (REQ-16/17) | `id`, `integration_id`, `tipo` (`producto/inventario/compra/venta`), `external_id`, `local_type`, `local_id`, `hash_contenido`, `sincronizado_en`, `ultimo_estado` — **únicas**: (`integration_id`,`tipo`,`external_id`) |
| `integration_external_docs` | Documentos cruzados (compras recibidas / ventas enviadas) | `id`, `integration_id`, `tipo`, `external_id`, `local_id`, `estado`, `datos` (JSON), `sincronizado_en` — **única**: (`integration_id`,`tipo`,`external_id`) |
| `integration_field_maps` | Mapeo de categorías/estados (HU-053) | `id`, `integration_id`, `dominio`, `clave_externa`, `valor_local` |

Índices recomendados: `integrations(estado)`, `integration_sync_runs(integration_id, iniciado_en)`, `integration_events(integration_id, severidad, created_at)`, `integration_records(local_type, local_id)`.

> Se reutiliza la tabla `settings` **solo** si se prefiere replicar el patrón exacto de pagos; la recomendación es tabla propia por tener relaciones, historial y consultas frecuentes.

### 7.4 API REST (bajo `/api/v1`, prefijo `/admin`)

| Método | Ruta | Permiso | Propósito |
|---|---|---|---|
| GET | `/admin/integraciones/sistemas` | `integraciones.ver` | Proveedores disponibles (desde código) |
| GET | `/admin/integraciones` | `integraciones.ver` | Listado + estado (REQ-10) |
| POST | `/admin/integraciones` | `integraciones.editar` | Crear (REQ-01) |
| GET | `/admin/integraciones/{id}` | `integraciones.ver` | Detalle sin credenciales |
| PUT | `/admin/integraciones/{id}` | `integraciones.editar` | Editar config/credenciales (REQ-02) |
| DELETE | `/admin/integraciones/{id}` | `integraciones.editar` | Eliminar (con confirmación) |
| POST | `/admin/integraciones/{id}/probar` | `integraciones.editar` | Probar conexión (REQ-03) |
| POST | `/admin/integraciones/{id}/activar` | `integraciones.editar` | Activar (REQ-14) |
| POST | `/admin/integraciones/{id}/desactivar` | `integraciones.editar` | Desactivar (REQ-14) |
| POST | `/admin/integraciones/{id}/sincronizar` | `integraciones.sincronizar` | Manual por tipo (REQ-08) |
| POST | `/admin/integraciones/{id}/importacion-inicial` | `integraciones.sincronizar` | Importación + preview (REQ-07) |
| GET | `/admin/integraciones/{id}/importacion-inicial/estado` | `integraciones.ver` | Progreso/reanudación |
| GET | `/admin/integraciones/{id}/ejecuciones` | `integraciones.historial` | Historial de ejecuciones |
| GET | `/admin/integraciones/{id}/eventos` | `integraciones.historial` | Errores y eventos con filtros (REQ-11) |
| GET | `/admin/integraciones/eventos/{evento}` | `integraciones.historial` | Detalle |
| POST | `/admin/integraciones/eventos/{evento}/reintentar` | `integraciones.sincronizar` | Reintento manual |
| GET | `/admin/integraciones/eventos/export` | `integraciones.historial` | Exportación CSV |
| GET | `/v1/login/integracion` | Público (throttle) | ¿Login federado activo? (REQ-15) |

El flujo de login federado vive en el endpoint público existente `POST /v1/login` (sin ruta nueva), conservando throttle 10/min.

### 7.5 Frontend — qué construir en la APP

| Elemento | Ubicación | Detalle |
|---|---|---|
| Sección "Integración de API" | `app/pages/admin/configuracion.vue` | Tarjeta con sistema conectado, estado resumido y atajo a la pantalla de detalle |
| Pantalla de integraciones | `app/pages/admin/integraciones.vue` (nueva) | Listado + estado + acciones; detalle lateral o ruta `/admin/integraciones/[id]` |
| Componentes | `app/components/admin/integrations/` | `IntegrationCard`, `CredentialsForm` (generado desde `fields`), `SyncStatusBadge`, `SyncRunList`, `EventTable`, `ImportWizard` (preview + progreso) |
| Servicio | `app/composables/services/admin/integraciones.ts` | Sigue el estilo de `useAdminPagosService()` (listar, obtener, crear, editar, probar, activar, sincronizar, ejecuciones, eventos) |
| Tipos | `app/types/integrations.ts` | `Integration`, `IntegrationProviderInfo`, `SyncRun`, `SyncEvent`, enums de estado |
| Menú | `app/components/navigation/AdminSidebar.vue` | Ítem "Integraciones" en grupo **Operaciones** (junto a Pagos y Envíos) |
| Login | `app/pages/auth/login.vue` + `Forms/AuthLoginForm` | Aviso opcional "Acceso validado con tu sistema" cuando `GET /v1/login/integracion` responde federado; manejo del mensaje de indisponibilidad |
| Reutilización visual | Referencia `app/pages/admin/pagos.vue` | Mismo patrón de tarjetas de proveedor, "Probar conexión", campos expandibles y estados |

### 7.6 Login federado — flujo paso a paso

```
1. Usuario envía email/usuario + contraseña a POST /v1/login
2. El servidor consulta: ¿existe integración activa con soporta_login = true?
        ├─ NO  → flujo local actual (cero cambios, AuthTest pasa igual)
        └─ SÍ  → IntegrationAuthenticator::loginFederado()
                     │
                     ├─ Llama a IntegrationProvider::login() contra la API externa
                     │      ├─ OK externo  → busca usuario local por email / external_id
                     │      │                 ├─ existe → crea sesión (token Sanctum)
                     │      │                 └─ no existe → lo crea con rol configurado y crea sesión
                     │      ├─ 401/403 externo → 401 "credenciales inválidas" + evento (NO intenta local)
                     │      └─ timeout / 5xx / caído → contingencia:
                     │              ├─ fallback_local = true  → login local normal + evento warning
                     │              └─ fallback_local = false → 503 "servicio no disponible"
                     │
                     └─ Auditoría + evento de éxito/fallo
3. Respuesta idéntica a la actual: { token, user } + redirección por rol
```

**Reglas de contingencia (RN-14 desviada para login):** credenciales rechazadas por el externo → nunca se aceptan localmente (evita bypass). Indisponibilidad del externo → el comportamiento es **configurable por integración** y, en su primera versión, se recomienda `fallback_local = true` con aviso al usuario y evento registrado.

### 7.7 Estrategia de sincronización

| Aspecto | Versión 1 | Evolución |
|---|---|---|
| Disparo manual | Endpoint + ejecución por lotes en proceso | Cola |
| Disparo automático | Comando `integrations:sync` en el planificador (cron `schedule:run`), `withoutOverlapping` por integración | Frecuencia menor a 15 min con Redis |
| Envío de ventas | Disparo al confirmar pago + barrido de pendientes en cada ejecución | Webhooks salientes / cola con reintentos dedicada |
| Reintentos | Política backoff en `config/integrations.php` + contador por evento | Dead-letter queue (RNF-17) |
| Bloqueo | Lock por integración (BD/cache) | Cola con worker dedicado |
| Observabilidad | Tablas de ejecuciones/eventos + `laravel.log` estructurado | Métricas, alertas, APM (RNF-06) |

### 7.8 Fases, esfuerzo y entregables

> Estimación en **días-persona** (desarrollo + pruebas básicas). Incluye +25% de contingencia por R-12.

| Fase | Contenido | HU | Esfuerzo | Entregable |
|---|---|---|---|---|
| **F0 · Base** | Migraciones (6 tablas), `config/integrations.php`, interfaces `IntegrationProvider`, `IntegrationCredentialService`, permisos `integraciones.*`, endpoints CRUD + probar, comando `integrations:sync` y registro en el planificador | 038, 039, 040 | 5 d | Conexión y prueba de acceso funcionando por API |
| **F1 · Panel de conexión** | Pantalla en Configuración → Integración de API, listado de sistemas, formulario de credenciales generado, botón "Probar conexión", alta/baja/activar-desactivar, menú lateral | 038–040, 051 | 4 d | Usuario conecta y valida un sistema sin ayuda técnica |
| **F2 · Catálogo e inventario** | `SyncService`, normalizadores de producto/inventario, importación inicial con preview y progreso, sincronización manual, `integration_records`, resúmenes | 041, 042, 043, 053 (parcial) | 7 d | Catálogo y stock sincronizados end-to-end |
| **F3 · Compras y ventas** | `integration_external_docs`, entrada de compras → stock, salida de venta → ERP con idempotencia y estados en el pedido, reintento manual | 044, 045 | 6 d | Ciclo completo de compras/ventas bidireccional |
| **F4 · Automatización y monitoreo** | Programación por frecuencia, ejecuciones/eventos con filtros y exportación, reintentos con backoff, circuit breaker, notificaciones, tablero de estado e indicadores | 046–049, 054 | 6 d | Operación autónoma con visibilidad total |
| **F5 · Multi-integración y mapeo** | Varias integraciones aisladas, mapeo de categorías/estados en UI, límites y avisos de conflicto (RN-11) | 050, 053 | 3 d | Varios sistemas conectados sin interferencias |
| **F6 · Login federado** | `AuthFederationService`, flag por integración, aviso en formulario, contingencia, eventos de auditoría, `AuthTest` ampliado | 052 | 4 d | Inicio de sesión validado contra el sistema externo |
| **F7 · Pruebas y endurecimiento** | Cliente HTTP fake con fixtures, tests de normalizadores, tests de autorización 403, E2E mínima de sincronización, actualización documental | Todas | 5 d | Criterio de terminado cumplido |
| | | **Total** | **40 d** | |

**Orden recomendado por valor:** F0 → F1 → F2 → F3 → F4 → F6 → F5 → F7.
*Justificación:* el login federado (F6) es independiente y de alto valor percibido, pero no habilita ventas; se coloca tras la sincronización operativa para no competir por foco en el mismo módulo.

### 7.9 Estrategia de pruebas

| Nivel | Qué probar | Cómo |
|---|---|---|
| Unitario | Normalizadores (JSON fixture → modelo), clasificación de errores, backoff, upsert por claves externas | `tests/Unit/` (hoy vacío: se crea la estructura) |
| Integración | Adaptador con HTTP fake, credenciales cifradas/descifradas, idempotencia de ejecuciones | `tests/Feature/` + cliente falso del proveedor |
| API | Autorización 403 por rol, validaciones, respuestas uniformes `{success, message, data}` | Extendiendo suites existentes |
| Regresión login | Login local intacto sin integración; federado con éxito/fallo/caída | Ampliar `AuthTest` (hoy ✅) |
| E2E manual | Conexión → importación inicial → sync manual → ver estado → ver error → reintentar → desactivar | Caso QA en Plan Scrum |
| Rendimiento | Importación de 1 000 productos, tiempo por lote, sin agotar memoria | Prueba de carga con catálogo sintético |

### 7.10 Criterios de terminado (Definition of Done)

- [ ] Código en `template_front` y `template_back`.
- [ ] `pnpm run lint` y `pnpm run typecheck` sin errores nuevos.
- [ ] `php -l` limpio y `php artisan test` sin regresiones (objetivo 78/78, hoy 70/8).
- [ ] Nuevas rutas con middleware de permiso y tests de autorización.
- [ ] Credenciales cifradas; ninguna respuesta API expone valores.
- [ ] Idempotencia verificada (ejecutar dos veces el mismo sync no duplica).
- [ ] Responsive ≥ 360 px y estados de carga/vacío/error cubiertos.
- [x] Documentación actualizada: SRS (RF-054/RF-055), Plan Scrum (HU-038…054), Manual Técnico (§9.4), Manual de Usuario (§3.14).
- [ ] Revisión de código aprobada.

### 7.11 Métricas de éxito

| Métrica | Objetivo |
|---|---|
| Tiempo de primera conexión exitosa | < 15 min desde el alta |
| Tasa de éxito de ejecuciones programadas | ≥ 98% en 30 días |
| Diferencia de stock entre sistemas tras cada sync | 0 (o registro marcado para revisión) |
| Ventas de la tienda reflejadas en el ERP | ≥ 99% en < 5 min |
| Registros duplicados creados por sync | 0 |
| Fallos de login federado por indisponibilidad | 0 aceptaciones indebidas; fallback funcionando |
| Incidencias de soporte "no coincide el stock" | −80% tras 60 días |

---

## 8. Anexo A · Ejemplo de normalización de datos

Supuesto: el proveedor devuelve un producto con su propia estructura y la plataforma lo traduce a su modelo.

**JSON de entrada (ejemplo de un proveedor):**

```json
{
  "item_code": "SKU-1001",
  "item_name": "Camiseta básica",
  "long_description": "Camiseta de algodón peinado…",
  "unit_price": 59.900,
  "list_price": 79.900,
  "tax_included": true,
  "warehouse_stock": 25,
  "category": { "id": 12, "name": "Ropa / Camisetas" },
  "brand_name": "MarcaPropia",
  "updated_at": "2026-10-08T14:32:11-05:00",
  "images": ["https://cdn.proveedor/img/1001.jpg"],
  "variants": [
    { "code": "SKU-1001-M", "color": "Negro", "size": "M", "stock": 10 },
    { "code": "SKU-1001-G", "color": "Negro", "size": "G", "stock": 15 }
  ]
}
```

**Traducción al modelo de CommerceOS:**

| Campo externo | Regla | Campo destino | Notas |
|---|---|---|---|
| `item_code` | literal | `products.sku` | Clave de upsert junto a `external_id` |
| — | generado/registrado | `integration_records.external_id` | Identificador único por integración |
| `item_name` | literal (trim) | `products.name` | Obligatorio; si vacío → evento de error |
| — | slugify de `name` | `products.slug` | Único; colisión → sufijo numérico |
| `long_description` | literal | `products.description` | Límite de longitud del modelo |
| `unit_price` | normaliza decimal y moneda | `products.price` | Moneda por integración (RN de conversión) |
| `list_price` | si `> unit_price` | `products.price_discount` | Si no, `null` |
| `tax_included` | config de impuestos | `products` + cálculo de `tax_rate` | Alineado con RF-027 |
| `warehouse_stock` | suma o raíz | `products.stock` | Raíz si hay variantes (la suma vive en variantes) |
| `category.name` | mapeo (`integration_field_maps`) | `categories` (crear si no existe o "Sin asignar") | HU-053 |
| `brand_name` | match por nombre / crear | `brands` | Idempotente |
| `updated_at` | parseo con timezone de la integración | comparación con `ultimo_sincronizado` | Incremental (RN-14) |
| `images[]` | descarga con límites | `product_images` | Máx. N por producto, tamaño máximo |
| `variants[]` | cada uno → fila | `product_variants` (sku, atributos, precio, stock) | Atributos vía `variant_attributes` existentes |
| `variants[].stock` | por variante | `stock_movements` + `product_variants.stock` | Origen `integracion` + `sync_run_id` (RN-25) |

**Otros dominios (resumen):**

| Dominio | Entrada externa | Normalización | Destino |
|---|---|---|---|
| Inventario | `{sku, qty, updated_at}` | Match por SKU/`external_id`; si `qty < 0` → revisar | `products.stock` / `product_variants.stock` + `stock_movements` |
| Compra (entrada) | `{po_number, date, supplier, lines[]}` | Idempotencia por `po_number`; match de líneas por SKU | `integration_external_docs` + `stock_movements` (`entrada`) |
| Venta (salida) | Pedido interno | Pedido → `{order_number, customer, lines[], totals, currency}` | Respuesta → `integration_external_docs.external_id` + estado en `orders` |
| Login | `{usuario, clave}` → respuesta `{token_o_ok, email, id}` | Mapea a usuario local por email o `external_id` | `users` + sesión Sanctum |

---

## Anexo B · Preguntas abiertas para el PO

| # | Pregunta | Impacto |
|---|---|---|
| 1 | ¿Cuál es el **primer proveedor real** a implementar? Define la plantilla de adaptador. | F0/F2 |
| 2 | ¿Segundo proveedor para validar la abstracción (R-11)? | F7 |
| 3 | ¿Frecuencia por defecto de la sincronización automática (15 min / 1 h)? | F4 |
| 4 | ¿Rol por defecto para usuarios creados por login federado (`cliente` o `admin`)? | F6 |
| 5 | ¿Fallback a login local cuando el sistema externo está caído (RN-14)? Recomendación: sí, con aviso. | F6 |
| 6 | ¿Dirección de verdad por defecto al conectar (externo manda / bidireccional)? Recomendación: externo manda en productos e inventario. | F2 |
| 7 | ¿Retención mínima del historial de eventos (90 días sugeridos)? | F4 |
| 8 | ¿Se contrata/define el límite de registros por ejecución según el contrato con el proveedor? | F4 |
