Requerimientos
Productos
Productos deben contar con características independientes, es decir puede existir atributos únicos para un solo producto, esto haría reutilizable el modelo para cualquier negocio
Productos deben clasificarse en marcas, categorías y tags para facilitar la búsqueda y la aplicación de filtros en catálogos
Productos deben poder relacionarse entre sí, mejora la recomendación al cliente incitando a comprar
Productos pueden clasificarse como destacados, para tener orden y preferencia de visualización en tienda
Desde visualización de cada producto se debe poder personalizar su vista, agregando secciones con características, imágenes, etc.

Tienda
Tienda debe ser personalizable para hacer que cada tienda tenga personalidad y vaya con cada negocio
Tienda debe contar entre 30 y 50 componentes diferentes de personalización, cada sección debe ser personalizable de una manera sencilla para que no requiera mucho tiempo para el usuario
Deben existir plantillas de ejemplo editables para facilitar la personalización de tienda, ofreciendo distintos negocios y diseños
Se debe personalizar Navbar, Footer, Estilos globales, página de inicio, página de cada producto, página sobre nosotros de la empresa

Pagos
Se debe poder visualizar detalladamente cada pago en la aplicación, debe enviar notificaciones push a cliente y administrador
Se debe implementar distintas APIs de pago para que el usuario registre la que más le convenga
El proceso de pago desde la tienda debe actualizare según la API de pago activa

Envíos
Se debe poder visualizar detalladamente cada envió desde administrador y visualizar seguimiento desde cliente

Configuración
Se debe poder configurar porcentaje de impuesto, moneda que se manejan los precios, configurar CEO de la pagina

Pedidos
Se debe poder visualizar pedidos de clientes de la tienda

Reportes
Se debe poder visualizar información de pagos, inventario, productos, clientes, además de exportarse en Excel, pdf y csv

Perfil
Se debe poder registrar a web push

 
Manual de la aplicación

Modulo Categorías
Campos que recibe:
Nombre	Campo	Tipo	Restricciones
Nombre	name	Varchar	
Slug	UNI		
Categoría padre			
Descripción 			
Url de imagen			
Orden			
Estado			

Al tener categoría padre la categoría se relaciona desde el cliente en recomendaciones búsqueda de catálogo, etc.
Si se elimina categoría padre se elimina relación

Modulo Productos
Campos que recibe:
•	Nombre
•	SKU
•	Descripción
•	Precio
•	Precio descuento (opcional)
•	Stock
•	Categoría
•	Marca
•	Estado
•	Producto destacado
•	Imágenes
•	Objeto builder para página de producto
Dentro de formulario se puede previsualizar pagina de producto desde modo cliente en la configuración de secciones de página. Para activar una sección primero se debe dar clic en inactiva y desplegara su configuración. (La configuración de secciones desde esta vista aplica únicamente para el producto que se está creando/editando, para una configuración global en página de producto ir a sección de personalizar tienda)
Secciones de página disponibles:
1.	Problema/solución
Headline problemas: título en tabla de lado problemas
Lista: 
•	Titulo
•	Descripción
Headline solución: titulo en tabla de lado soluciones
Lista:
•	Titulo
•	Descripción

2.	Transformación
•	Headline
•	Subtext
•	URL imagen del antes
•	URL imagen del después 
Listas
Antes:
•	Titulo
•	Descripción
Después
•	Titulo
•	Descripción

3.	Características
•	Titulo
•	Subtitulo
Ítems:
•	Icono
•	Titulo
•	Descripción
•	URL imagen (opcional)

4.	Comparativa
•	Headline
•	Subtext
Columnas
•	Descripción
•	¿Es nuestro?
Filas
•	Característica

5.	Bundle oferta
6.	Countdown
7.	Testimonios
8.	UGC Clientes
9.	Modulo inventario

Modulo inventario
Creación de alertas de stock para llevar control de inventario
Selecciona producto
Ingresar stock mínimo
Estado

Ver movimientos del inventario
Lista de movimientos con fecha, producto, tipo, cantidad, Razón.
Filtros tipo de movimiento:
•	Entrada
•	Salida
•	Ajuste

Registrar nuevo movimiento
Seleccionar producto
Seleccionar tipo de movimiento
Cantidad
Razón

Modulo editor de tienda
El administrador debe personalizar su tienda marcando su diferencial de marca, se podrá editar cada sección, orden de secciones, colores, tipografía.
El módulo cuenta con una barra de navegación de configuraciones, navbar para acciones rápidas, y previsualización en tiempo real de los cambios de la tienda

Navbar de acciones rápidas
•	Botón de regresar
•	Botón para expandir página de edición ocultando el navbar y aside bar de la aplicación
•	Botones de regresar o adelantar cambios
•	Aviso si hay cambios realizados
•	Botón de guardar la tienda

Barra de navegación de configuraciones
En la parte superior se puede observar cuatro (4) módulos de personalización: 

Inicio: Configuración de la pagina principal de la tienda
Producto: Configuración global de la página de producto
Nosotros: Configuración de la página sobre nosotros
Global: Configuración global de la tienda

Página de inicio
Desde la barra de navegación el sistema mostrará las secciones de la pagina de inicio, al seleccionar una categoría se desplegará su configuración en la parte final de la misma barra
•	cada sección se puede mover de orden, duplicar, ocultar o eliminar. 
Al agregar sección se desplegará modal donde se mostrará cada sección disponible, mostrando su título, descripción, variantes y previsualización.
Las secciones están agrupadas por tipos donde se podrá buscar o filtrar Hero, Contenido, Conversión, Social, Media, Layout

Hero:
Variantes: Clásico, Centrado, Dividido
Personalización: 
•	Badge
•	Headline
•	Subtext
•	CTA Principal, URL
•	URL imagen
Header:
Página de producto
Desde la barra de navegación el sistema mostrará las secciones disponibles para pagina de producto, aquellas que digan individual solo se podrán visualizar ya que su configuración se hace desde edición de producto, en la parte inferior la configuración de la sección activa
Al elegir variante de diseño se desplegará modal donde se mostrará los tipos de diseño disponibles, mostrando su título, descripción y visualización

Página de nosotros
Desde la barra de navegación el sistema mostrará las secciones disponibles para pagina de nosotros, al seleccionar una se podrá hacer visible una sección y se mostrará la configuración de la sección activa.

Estilos globales
Desde la barra de navegación el sistema mostrará tres secciones, la primera estilos donde se configura colores de la página, paleta de colores, tipografía, bordes y espaciados.
Navbar, con elementos opcionales como mostrar búsqueda, mostrar carrito, mostrar favoritos. Además, links de navegación con
•	Label
•	URL
•	Visible
Footer, con configuración de:
•	Texto de copyright
Columnas adicionables:
•	Titulo
•	Links: label, url

Modulo plantillas
Modulo configuración
Modulo pagos
Modulo envíos
Modulo reportes
Modulo pedidos
Modulo usuarios
Modulo perfil

Flujo de trabajo
Administrador
Productos
-	crear productos

