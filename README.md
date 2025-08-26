# Proyecto FullStack para la gestión de recetas de cocina 🥤🥗🍔🍗🍟🥓

Aplicación web desarrollada con React + Flask para la gestión de recetas de cocina. El usuario debe autenticarse para poder acceder a la app. Si no tiene usuario creado, debe registrarse. Al acceder se redirige a la página principal donde se listan todas las recetas creadas por todos los usuarios.

## Herramientas y lenguajes utilizados:
<p style="display:flex; justify-content:center;gap:2rem;">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="60"/>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="60"/>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="60"/>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" width="60"/>
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" width="60"/>
</p>

### Imágenes
![Captura de la App](public\img\github_sample.jpg)

### Base de datos
Utiliza MySQL como motor de base de datos para guardar las recetas y los usuarios. Dentro de cada receta se guardan los ingredientes como un objeto JSON pero en texto plano, para luego construir objectos y acceder a sus propiedades.

### Autenticación
JWT (JSON Web Tokens) para manejar sesiones de usuario. Se generan tokens firmados y se protegen las rutas sensibles (create_recipe, update_recipe y delete_recipe).

Los usuarios guardan su rol y pueden editar y borrar sus recetas. Los admin pueden borrar y editar las recetas de los demas usuarios y las suyas. Registro de usuario con hash de contraseña usando bcrypt. Login que devuelve token JWT y datos de usuario (username y role)

### Routing
Uso de Blueprints de Flask para el enrutamiento de la app. Cada ruta tiene un comportamiento definido con Python. Se utiliza JWT para asegurar las rutas.

### Buscador de recetas por nombre, ingrediente o creador de la receta
Busca en la BDD por medio del Backend el término escrito por el usuario y muestra el resultado en tiempo real, de esta manera la búsqueda es mucho más eficiente que si se realizase en el Frontend.

### React context
Se utiliza para la autenticación del usuario, guardando el token durente la sesión y para manejar el login y logout del usuario. De esta manera se evita tener que pasar como props el usuario y su token a traves de los componentes padres e hijos. Se crea un provider para poder usar el contexto en toda la app.

### ToDo --> Comentarios en recetas
Crear nueva tabla para guardar comentarios y votos que hagan los usuarios de cada receta. Un voto / comentario por usuario. Dentro de cada receta aparecerán los comentarios de los usuarios con el voto de cada comentario, si hay muchos votos que se paginen de 5 en 5. El usuario creador de la receta no puede votarse a si mismo, solo lo puede hacer admin.