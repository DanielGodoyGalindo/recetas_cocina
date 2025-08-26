import mysql.connector
import bcrypt
import json

# https://pypi.org/project/flask-mysql-connector/

# mysql connection
conn = mysql.connector.connect(host="localhost", user="root", password="root")
cursor = conn.cursor()

# create db
cursor.execute("CREATE DATABASE IF NOT EXISTS recipesapp")
cursor.execute("USE recipesapp")

cursor.execute("DROP TABLE IF EXISTS recipes;")
cursor.execute("DROP TABLE IF EXISTS users;")

# recipes table
cursor.execute("""
CREATE TABLE recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    ingredients JSON,
    imageUrl VARCHAR(255),
    created_by VARCHAR(255) DEFAULT 'admin'
)
""")

# users table
cursor.execute("""
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') DEFAULT 'user'
)
""")

# comments table
cursor.execute("""
  CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text_comment TEXT NOT NULL,
    vote INT NOT NULL CHECK (vote BETWEEN 1 AND 5),
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_id)
)             
""")

# @development
# admin user
username = "admin"
password = "admin"
role = "admin"
hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
cursor.execute(
    "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
    (username, hashed_pw.decode("utf-8"), role),
)

# seeds
recipes = [
    {
        "title": "Tortilla de patatas",
        "description": "Receta tradicional española",
        "ingredients": {
            "Huevos": "4",
            "Patatas": "300 gr",
            "Aceite": "al gusto",
            "Sal": "una pizca",
        },
        "imageUrl": "https://recetasdecocina.elmundo.es/wp-content/uploads/2025/02/tortilla-de-patatas-1.jpg",
    },
    {
        "title": "Paella",
        "description": "Arroz valenciano con mariscos",
        "ingredients": {
            "Arroz": "250 gr",
            "Langostinos": "8",
            "Azafrán": "1 sobre",
            "Pimiento": "1",
        },
        "imageUrl": "https://imag.bonviveur.com/paella-de-pollo.jpg",
    },
    {
        "title": "Pizza margarita",
        "description": "Receta tradicional italiana",
        "ingredients": {
            "Harina": "500 gr",
            "Levadura": "1 sobre",
            "Tomate": "200 gr",
            "Mozarella": "150 gr",
            "Albahaca": "al gusto",
        },
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg",
    },
    {
        "title": "Tortitas",
        "description": "Desayuno perfecto",
        "ingredients": {
            "Harina": "200 gr",
            "Mantequilla": "50 gr",
            "Azúcar": "30 gr",
            "Huevos": "2",
            "Leche": "200 ml",
            "Levadura": "1 cucharadita",
        },
        "imageUrl": "https://recetasdecocina.elmundo.es/wp-content/uploads/2024/10/receta-de-tortitas-1024x683.jpg",
    },
]

# Insertar recetas con ingredientes en JSON
# insert recipes from recipes array
for recipe in recipes:
    cursor.execute(
        """
        INSERT INTO recipes (title, description, ingredients, imageUrl)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE description=%s
        """,
        (
            recipe["title"],
            recipe["description"],
            # serialize python dictionary to json string
            json.dumps(recipe["ingredients"], ensure_ascii=False),
            recipe["imageUrl"],
            recipe["description"],
        ),
    )

conn.commit()
conn.close()

print("Recetas guardadas en MySQL correctamente.")
