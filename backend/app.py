from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import mysql.connector
import bcrypt

# Flask tutorial
# https://flask-jwt-extended.readthedocs.io/en/stable/basic_usage.html

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "clave-super-secreta"

CORS(app)
jwt = JWTManager(app)


# Mysql connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost", user="root", password="root", database="recipesapp"
    )


# Routing
@app.route("/api/recipes")
def get_recipes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, title, description FROM recipes")
    recipes = cursor.fetchall()

    # get ingredientes for each recipe
    for recipe in recipes:
        cursor.execute(
            "SELECT name FROM ingredients WHERE recipe_id = %s", (recipe["id"],)
        )
        ingredients = [row["name"] for row in cursor.fetchall()]
        recipe["ingredients"] = ingredients

    cursor.close()
    conn.close()
    return jsonify(recipes)


@jwt_required()
def create_recipe():
    current_user = get_jwt_identity()
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    imageUrl = data.get("imageUrl")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO recipes (title, description, imageUrl, created_by) VALUES (%s, %s, %s, %s)",
        (title, description, imageUrl, current_user),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"msg": "Receta creada con éxito"}), 201


# Dinamic id routing
# Obtener receta (GET público)
@app.route("/api/recipes/<int:recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, title, description, imageUrl, created_by FROM recipes WHERE id = %s",
        (recipe_id,),
    )
    recipe = cursor.fetchone()

    if not recipe:
        cursor.close()
        conn.close()
        return jsonify({"error": "No se ha encontrado la receta!"}), 404

    cursor.execute("SELECT name FROM ingredients WHERE recipe_id = %s", (recipe_id,))
    ingredients = [row["name"] for row in cursor.fetchall()]
    recipe["ingredients"] = ingredients
    cursor.close()
    conn.close()
    return jsonify(recipe)


# Actualizar receta (PUT, requiere token)
@app.route("/api/recipes/<int:recipe_id>", methods=["PUT"])
@jwt_required()
def update_recipe(recipe_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    imageUrl = data.get("imageUrl")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT created_by FROM recipes WHERE id = %s", (recipe_id,))
    recipe = cursor.fetchone()

    if not recipe:
        return jsonify({"msg": "Receta no encontrada"}), 404

    if (
        current_user["role"] != "admin"
        and recipe["created_by"] != current_user["username"]
    ):
        return jsonify({"msg": "No tienes permiso para editar esta receta"}), 403

    cursor.execute(
        "UPDATE recipes SET title=%s, description=%s, imageUrl=%s WHERE id=%s",
        (title, description, imageUrl, recipe_id),
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "Receta actualizada con éxito"}), 200


# Borrar receta (DELETE, requiere token)
@app.route("/api/recipes/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_recipe(recipe_id):
    current_user = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT created_by FROM recipes WHERE id = %s", (recipe_id,))
    recipe = cursor.fetchone()

    if not recipe:
        return jsonify({"msg": "Receta no encontrada"}), 404

    if (
        current_user["role"] != "admin"
        and recipe["created_by"] != current_user["username"]
    ):
        return jsonify({"msg": "No tienes permiso para borrar esta receta"}), 403

    cursor.execute("DELETE FROM recipes WHERE id = %s", (recipe_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"msg": "Receta eliminada con éxito"}), 200


# Register
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Usuario y contraseña requeridos!"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.IntegrityError:
        return jsonify({"msg": "¡El usuario ya existe!"}), 409

    return jsonify({"msg": "Usuario registrado correctamente!"}), 201


# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password, role FROM users WHERE username=%s", (username,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if result and bcrypt.checkpw(password.encode("utf-8"), result[0].encode("utf-8")):
        token = create_access_token(identity={"username": username, "role": result[1]})
        return jsonify({"access_token": token}), 200
    else:
        return jsonify({"msg": "Credenciales inválidas"}), 401


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"msg": f"Hola {current_user}, estás autenticado!"})


if __name__ == "__main__":
    app.run(debug=True)
