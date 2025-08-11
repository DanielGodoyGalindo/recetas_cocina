from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configuración conexión MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="recipesapp"
    )

# Routing
@app.route('/api/recipes')
def get_recipes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, title, description FROM recipes")
    recipes = cursor.fetchall()

    # Para cada receta, obtener sus ingredientes
    for recipe in recipes:
        cursor.execute("SELECT name FROM ingredients WHERE recipe_id = %s", (recipe['id'],))
        ingredients = [row['name'] for row in cursor.fetchall()]
        recipe['ingredients'] = ingredients

    cursor.close()
    conn.close()
    return jsonify(recipes)


@app.route('/api/recipes/<int:recipe_id>')
def get_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, title, description, imageUrl FROM recipes WHERE id = %s", (recipe_id,))
    recipe = cursor.fetchone()

    if not recipe:
        cursor.close()
        conn.close()
        return jsonify({"error": "Recipe not found"}), 404

    cursor.execute("SELECT name FROM ingredients WHERE recipe_id = %s", (recipe_id,))
    ingredients = [row['name'] for row in cursor.fetchall()]
    recipe['ingredients'] = ingredients

    cursor.close()
    conn.close()
    return jsonify(recipe)


if __name__ == '__main__':
    app.run(debug=True)
