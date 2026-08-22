# Primo Físico

Sitio independiente de divulgación y estudio de física. Reúne posts en cuatro idiomas, apuntes, guías y material docente.

## Estado

- Repositorio previsto: `bastiancastorene/primofisico-web`
- Publicación: GitHub Pages
- Dominio previsto: `www.primofisico.com`
- El archivo `CNAME` publica `www.primofisico.com`; HTTPS está forzado en GitHub Pages.

Los PDFs permanecen en Google Drive; el repositorio conserva las páginas, el código y las miniaturas necesarias para mostrarlos.

## Prueba local

Servir la carpeta con un servidor HTTP desde la raíz del repositorio. No abrir `index.html` directamente con `file://`, porque las rutas absolutas y las cargas de material requieren un origen HTTP.

## Subposts de Saber por Saber

La colección tiene su portada en `/saber/`. Sus subposts usan la variante visual `pf-saber-post`. Cada página debe declarar `class="pf-saber-post"` en `<body>`, cargar `/saber-post.css?v=2` después de los estilos compartidos y cargar `/saber-post.js?v=2` después de `app.js`. El script añade únicamente la decoración de fondo; el contenido, los idiomas y las interacciones siguen usando los componentes compartidos.

## Publicación

1. Mantener el dominio en una cuenta propia con privacidad, 2FA y renovación automática.
2. Mantener GitHub Pages en la rama `main` y la carpeta raíz.
3. Mantener `CNAME` con `www.primofisico.com` y los registros DNS indicados por GitHub Pages.
4. Verificar HTTPS, rutas internas, los cuatro idiomas y las interacciones después de cada publicación.

## Seguridad

- La validación estática se ejecuta en `.github/workflows/site-integrity.yml`.
- Las acciones externas del workflow se fijan a un commit SHA.
- El sitio incluye una política CSP de respaldo mediante `meta` porque GitHub Pages no permite definir cabeceras HTTP propias.
- Las claves publicadas del cliente Supabase son únicamente claves públicas; nunca se debe subir una clave `service_role`.
- Las políticas RLS, los permisos de las funciones RPC, la moderación y el CAPTCHA se administran en el proyecto Supabase.
