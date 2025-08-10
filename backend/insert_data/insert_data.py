import mysql.connector

# Conexión al servidor MySQL (ajusta usuario y contraseña)
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root"
)
cursor = conn.cursor()

# Crear base de datos
cursor.execute("CREATE DATABASE IF NOT EXISTS recipesapp")
cursor.execute("USE recipesapp")

cursor.execute("""
DROP TABLE IF EXISTS ingredients;
""")
cursor.execute("""
DROP TABLE IF EXISTS recipes;
""")

# Crear tabla recipes
cursor.execute("""
CREATE TABLE recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT
)
""")

# Crear tabla ingredients

cursor.execute("""
CREATE TABLE ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipe_id INT,
    name VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
)
""")
conn.commit()

recipes = [
    {"id": 1, "title": "Tortilla de patatas", "description": "Receta tradicional española", "ingredients": ["Huevos", "Patatas", "Aceite", "Sal"]},
    {"id": 2, "title": "Paella", "description": "Arroz valenciano con mariscos", "ingredients": ["Arroz", "Langostinos", "Azafrán", "Pimiento"]}
]

# Insertar recetas e ingredientes
for recipe in recipes:
    cursor.execute(
        "INSERT INTO recipes (title, description) VALUES (%s, %s) ON DUPLICATE KEY UPDATE description=%s",
        (recipe["title"], recipe["description"], recipe["description"])
    )
    recipe_id = cursor.lastrowid  # ID generado por AUTO_INCREMENT o UPDATE existente

    # Si la receta ya existía y se actualizó, lastrowid puede ser 0, 
    # entonces hay que obtener el id de la receta con un SELECT:
    if recipe_id == 0:
        cursor.execute("SELECT id FROM recipes WHERE title = %s", (recipe["title"],))
        recipe_id = cursor.fetchone()[0]

    for ingredient in recipe["ingredients"]:
        cursor.execute(
            "INSERT INTO ingredients (recipe_id, name) VALUES (%s, %s)",
            (recipe_id, ingredient)
        )

conn.commit()
conn.close()

print("Recetas guardadas en MySQL correctamente.")