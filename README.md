# Congreso AMERE 2026

Sitio estático de «Diálogo de dos mundos», sin compilación, backend ni base de
datos. Se publica sirviendo esta carpeta como raíz del sitio.

- `index.html`: portada, contenido y traducciones en español, portugués y ruso.
- `css/styles.css`: todos los estilos del inicio, la galería y el visor.
- `galeria.html`: galería organizada por día y actividad.
- `scripts/gallery.js`: pestañas, mosaico y visor de fotografías.
- `scripts/language.js`: selector y preferencia de idioma compartidos.
- `scripts/gallery-translations.js`: textos, días y actividades de la galería en español, portugués y ruso.
- `scripts/albums.json`: catálogo que utiliza la galería.
- `scripts/serve.py`: servidor de desarrollo local en Python.
- `media/IMG/`: imágenes del sitio, fotografías WebP y miniaturas.
- `media/PDF/`: programas y convocatorias originales.
- `CNAME`: dominio de publicación.

Las rutas públicas son `/` y `/galeria.html`. Solo hace falta un servidor de archivos
estáticos; Google Fonts y los formularios de registro son servicios externos.

Las herramientas de preparación de imágenes, pruebas, documentación de trabajo,
configuración del editor y respaldos se conservan localmente, excluidos mediante
`.gitignore`. No se necesitan para publicar ni para ejecutar el sitio.

## Ejecutar el sitio localmente

Desde la raíz del proyecto, con Python instalado:

```powershell
python scripts/serve.py
```

Abre `http://127.0.0.1:8000/` para la portada o
`http://127.0.0.1:8000/galeria.html` para las fotografías. El servidor local
redirige `/galeria` y `/galeria/` a la nueva página. En VS Code también puedes
iniciarlo con la tarea local «AMERE: servidor local», si está configurada.
Detén el servidor con `Ctrl+C`. Abre la galería por HTTP para que JavaScript
pueda cargar su catálogo.

## Navegación e idiomas

Ambas páginas comparten el estilo del encabezado, el logotipo y el selector de
idioma. En la portada, el menú aparece debajo del encabezado al desplazarse y
ajusta la llegada a las secciones según la altura de la navegación. «Galería ↗»
es el último enlace y se distingue en dorado. En la galería, «Congreso 2026»
en la ruta de navegación permite volver a la portada.

El selector ofrece español, portugués y ruso, guarda la preferencia en el
navegador y la conserva en los enlaces entre las páginas. Un parámetro válido
como `?lang=ru` tiene prioridad sobre la preferencia guardada. El idioma
predeterminado es español. Por ejemplo, `/galeria.html?lang=pt#dia-2` abre el
segundo día en portugués. Cambiar el idioma en la galería conserva el día y
la actividad seleccionados.

Los botones «Explorar la galería» y los dos registros comparten la clase
`.cta`, con forma rectangular y esquinas redondeadas. El registro de ponentes
usa la variante roja `.cta-ponentes`. El programa, la convocatoria y los
formularios de registro de la portada se enlazan según el idioma seleccionado.

## Cómo funciona la galería

La galería está escrita con HTML, CSS y JavaScript nativo. Contiene
469 fotografías, con 254 en las 10 actividades del día 1 y 215 en las 13
actividades del día 2.

### Componentes de la interfaz

| Componente | Ubicación | Funcionamiento |
| --- | --- | --- |
| Accesos desde la portada | `index.html` | El menú, el botón «Explorar la galería» y el mosaico de presentación enlazan a `galeria.html`. |
| Encabezado, ruta de navegación y pie | `galeria.html` | Comparte con la portada el encabezado con logotipo y selector de idioma. El logotipo, la ruta de navegación y el enlace del pie permiten regresar a la portada. |
| Presentación y cifras | `.intro`, `#total-photos`, `#total-albums` | Muestran el título y el resumen. Tras cargar el JSON, el total de fotos se toma de `catalog.count` y el de actividades se calcula sumando los álbumes de cada día. |
| Pestañas de días | `.day-tabs`, `.day-tab`, `.day-panel` | Activan un día y ocultan el otro mediante `hidden`. La barra permanece visible al desplazarse. Los álbumes de cada día se crean solo la primera vez que se visita su pestaña. |
| Resumen del día | `#day-description` | Informa la fecha, el número de actividades y la cantidad de fotografías del día seleccionado. Sus cambios se anuncian mediante `aria-live`. |
| Selector de actividades | `#activity-jump` | Se llena con las actividades del día activo. Al elegir una, desplaza la página a su sección y enfoca su primera fotografía. |
| Sección de actividad | `.album`, `.album-header` | Agrupa título, subtítulo opcional, número y cantidad de fotos. El número se muestra con dos dígitos; `order: null` se representa con «＋». |
| Mosaico de fotografías | `.photo-grid`, `.photo-tile` | Crea un botón por foto con su miniatura y número. Las alturas varían para formar un mosaico; las fotos verticales reciben más altura. Al pulsar un botón se abre el visor en esa foto y actividad. |
| Estados de carga y recuperación | `#gallery-status`, `#retry-gallery`, `noscript` | Indican la carga del catálogo, muestran un mensaje y «Volver a intentar» si falla, o piden activar JavaScript cuando está deshabilitado. Una miniatura que falla muestra un aviso en su tarjeta. |
| Visor modal | `#photo-viewer` | Usa un elemento nativo `dialog`. Muestra la actividad, el día y el subtítulo o fecha, bloquea el desplazamiento de la página y coloca el foco en el botón de cierre. |
| Imagen y estado del visor | `#viewer-stage`, `#viewer-image`, `#viewer-image-status` | Muestran primero la miniatura y la sustituyen por la foto completa al terminar su carga. Si falla, conservan la miniatura e informan del problema. |
| Controles y contador | `#viewer-prev`, `#viewer-next`, `#viewer-counter`, `#viewer-close` | Recorren únicamente las fotos de la actividad abierta. Después de la última se vuelve a la primera y viceversa. Si hay una sola foto, las flechas se deshabilitan. El contador anuncia la posición actual. |

### Navegación, teclado y accesibilidad

- Las pestañas admiten clic, flechas izquierda/derecha y `Home`/`End`. Solo la
  pestaña seleccionada participa en el recorrido normal con `Tab`.
- Al seleccionar un día se actualiza el fragmento de la URL: `#dia-1` o
  `#dia-2`. Por ejemplo, `/galeria.html#dia-2` abre directamente el segundo día.
  Si el fragmento inicial no corresponde a un día, se muestra el primero.
- Dentro del visor, las flechas izquierda/derecha cambian de foto y `Home`/`End`
  llevan a la primera o última de la actividad. En pantallas táctiles se puede
  deslizar horizontalmente sobre el área de la imagen.
- El visor se cierra con `Esc`, con «Cerrar visor» o al pulsar el fondo o un área
  vacía de la zona de imagen. Al cerrar, el foco regresa a la miniatura de origen.
- Los botones de fotos tienen nombres accesibles; la imagen del visor incluye
  la actividad y su posición en el texto alternativo. Hay indicadores de foco,
  avisos de estado y un enlace «Saltar a las fotografías» al inicio.

### Estilos y adaptación a pantallas

En `css/styles.css`, `.site-header` reúne los estilos del encabezado
compartido, y `.page-gallery` y `.page-home` contienen los estilos de cada
página. El mosaico usa CSS Grid con
colocación densa: cuatro columnas por defecto, cinco desde 1600 px, tres hasta
1100 px y dos hasta 760 px. Las miniaturas usan `object-fit: cover`, por lo que
pueden verse recortadas; el visor muestra la fotografía completa con
`object-fit: contain`.

En móvil se ajustan encabezado, tipografía y controles del visor. Los estilos
también respetan la preferencia `prefers-reduced-motion` para reducir animaciones
y desplazamientos suaves.

### Lógica de JavaScript

`scripts/gallery.js` se ejecuta con `defer` y encapsula su estado para no crear
variables globales. Estas son sus funciones principales:

| Función | Responsabilidad |
| --- | --- |
| `text()` | Crea elementos con clase y contenido usando `textContent`. |
| `loadGallery()` | Solicita `scripts/albums.json`, comprueba que existan días con álbumes, actualiza las cifras y activa el día inicial. Gestiona el mensaje de error y el reintento. |
| `renderDay()` | Construye las secciones y miniaturas de un día con un `DocumentFragment`. Marca el panel con `data-rendered` para no duplicarlo al volver. Cada mosaico comparte un listener de clic para todas sus fotos. |
| `switchDay()` | Selecciona el día, cierra el visor si está abierto, actualiza pestañas, paneles, resumen y selector. Según las opciones recibidas, mueve el foco, desplaza la página o actualiza la URL. |
| `changeLanguage()` | Actualiza los textos, las etiquetas accesibles y las actividades visibles con las traducciones de `scripts/gallery-translations.js`. |
| `openViewer()` | Guarda la actividad y el botón de origen, actualiza el encabezado, abre el diálogo y solicita la foto elegida. |
| `showPhoto()` | Calcula la posición circular dentro del álbum, actualiza contador y texto alternativo, y carga la foto completa. Usa `loadVersion` para descartar respuestas que llegan después de cambiar de foto o cerrar el visor. |

Los eventos conectan estas funciones con pestañas, selector, controles, teclado,
cambios de fragmento y gestos táctiles. Al cerrar el visor se invalidan las cargas
pendientes y se limpian las referencias a la actividad y a las precargas.

### Catálogo e imágenes

`scripts/albums.json` es la fuente de datos. El orden de sus arreglos determina
el orden visible de días, actividades y fotos; el navegador no ordena por
`order`. Este campo solo define la etiqueta numérica de la actividad.

| Nivel | Campos | Uso |
| --- | --- | --- |
| Catálogo | `count`, `days` | Total de fotografías y lista de días. |
| Día | `id`, `label`, `date`, `count`, `albums` | Identificador de pestaña/panel, nombre breve, fecha, total de fotos y actividades. |
| Actividad | `id`, `order`, `title`, `subtitle`, `photos` | Identificador único de sección, número o `null`, título, subtítulo y lista de fotografías. |
| Fotografía | `src`, `thumbnail`, `width`, `height` | Ruta de la imagen completa, ruta de miniatura y dimensiones de la imagen completa en píxeles. |

Ejemplo de una fotografía del catálogo:

```json
{
  "src": "media/IMG/congreso-amere/dia-1/00-inauguracion/img-0563-edited.webp",
  "thumbnail": "media/IMG/congreso-amere-miniaturas/dia-1/00-inauguracion/img-0563-edited.webp",
  "width": 2000,
  "height": 1333
}
```

Las rutas de imágenes se resuelven respecto a `galeria.html`:

- `media/IMG/congreso-amere/`: fotografías completas en WebP.
- `media/IMG/congreso-amere-miniaturas/`: versiones pequeñas utilizadas en el mosaico.

Las miniaturas usan carga diferida (`loading="lazy"`) y decodificación asíncrona.
El visor solicita la foto completa al abrirla y, cuando termina de cargar,
precarga solo sus vecinas anterior y siguiente dentro de la misma actividad.

## Agregar o actualizar fotografías

1. Coloca la fotografía completa y su miniatura en sus respectivas carpetas de
   `media/IMG/`, siguiendo la organización por día y actividad.
2. Agrega su objeto a `photos` en la actividad correspondiente de
   `scripts/albums.json`, con rutas y dimensiones correctas. Mantén al menos una
   foto por actividad y utiliza identificadores de actividad únicos.
3. Para una actividad nueva, agrega un álbum al arreglo `albums` del día. Define
   `order`, `title` y `subtitle` (puede ser `""`), y colócalo en la posición en la
   que debe aparecer. Usa su identificador para agregar el título y, si
   corresponde, el subtítulo en portugués y ruso en `scripts/gallery-translations.js`.
4. Actualiza `count` del día y del catálogo. Las cifras de actividades y de fotos
   por álbum se calculan automáticamente; los totales del catálogo y de cada día
   se leen del JSON. Actualiza también las cifras iniciales de `#total-photos` y
   `#total-albums` en `galeria.html` para evitar valores antiguos durante
   la carga.
5. Si agregas otro día, crea también su botón y panel en `galeria.html`,
   siguiendo los existentes: `data-day`, `aria-controls`, `aria-labelledby` e
   identificadores `tab-<id>` y `panel-<id>` deben coincidir con su `id` en el JSON.
   Agrega las fechas y los nombres de la pestaña en `days` para los tres idiomas.
6. Sirve el sitio localmente y comprueba ambos días, el selector, las fotos nuevas
   y el recorrido del visor. Revisa teclado, cierre, retorno del foco y pantalla
   móvil, y confirma que las rutas responden sin errores.

No se necesita reconstruir el sitio al editar el catálogo. En el equipo de
trabajo pueden existir scripts locales de preparación y pruebas, pero están
excluidos de Git; los pasos anteriores funcionan con los archivos del repositorio.

## Publicación

Publica la raíz del repositorio en un alojamiento estático, conservando la
estructura de carpetas y los nombres de archivo, incluidas mayúsculas y
minúsculas. Debe servir HTML, CSS, JavaScript, JSON e imágenes WebP. La galería
usa rutas relativas y no necesita reglas de enrutamiento de una aplicación SPA.
`CNAME` contiene el dominio configurado para la publicación. Usa
`/galeria.html` en los enlaces públicos. Las redirecciones de `/galeria` y
`/galeria/` están configuradas en el servidor de desarrollo.
