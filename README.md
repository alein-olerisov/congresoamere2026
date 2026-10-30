# Congreso AMERE 2026

Sitio estático de «Diálogo de dos mundos», sin compilación, backend ni base de
datos. Se publica sirviendo esta carpeta como raíz del sitio.

- `index.html`: portada, contenido y traducciones en español, portugués y ruso.
- `css/styles.css`: todos los estilos del inicio, la galería y el visor.
- `galeria/index.html`: galería organizada por día y actividad.
- `galeria/gallery.js`: pestañas, mosaico y visor de fotografías.
- `galeria/albums.json`: catálogo que utiliza la galería.
- `img/`: imágenes del sitio, fotografías WebP y miniaturas.
- `pdf/`: programas y convocatorias originales.
- `CNAME`: dominio de publicación.

Las rutas públicas son `/` y `/galeria/`. Solo hace falta un servidor de archivos
estáticos; Google Fonts y los formularios de registro son servicios externos.

Las herramientas de preparación de imágenes, pruebas, documentación de trabajo,
configuración del editor y respaldos se conservan localmente, excluidos mediante
`.gitignore`. No se necesitan para publicar ni para ejecutar el sitio.
