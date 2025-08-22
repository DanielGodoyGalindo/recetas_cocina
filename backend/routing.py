from db import get_db_connection
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import bcrypt
import json
from flask import jsonify, request, Blueprint
import mysql.connector

recipes_bp = Blueprint("recipes", __name__)

# Routing
@recipes_bp.route("/api/recipes", methods=["GET"])
def get_recipes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, title, description, ingredients, imageUrl, created_by FROM recipes"
    )
    recipes = cursor.fetchall()

    # Convertir JSON de ingredients a dict
    for recipe in recipes:
        if recipe["ingredients"]:
            recipe["ingredients"] = json.loads(recipe["ingredients"])
        else:
            recipe["ingredients"] = {}

    cursor.close()
    conn.close()
    return jsonify(recipes)


@recipes_bp.route("/api/recipes/<int:recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, title, description, ingredients, imageUrl, created_by FROM recipes WHERE id = %s",
        (recipe_id,),
    )
    recipe = cursor.fetchone()

    if not recipe:
        cursor.close()
        conn.close()
        return jsonify({"error": "No se ha encontrado la receta!"}), 404

    if recipe["ingredients"]:
        # converts json string from db to python dictionary
        recipe["ingredients"] = json.loads(recipe["ingredients"])
    else:
        recipe["ingredients"] = {}

    cursor.close()
    conn.close()
    return jsonify(recipe)


@recipes_bp.route("/api/recipes", methods=["POST"])
@jwt_required()
def create_recipe():
    current_user = get_jwt_identity()
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    imageUrl = data.get("imageUrl")
    ingredients = data.get("ingredients", {})

    if not title or not description or not ingredients:
        return jsonify(
            {"msg": "Título, descripción e ingredientes son obligatorios"}
        ), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO recipes (title, description, ingredients, imageUrl, created_by) VALUES (%s, %s, %s, %s, %s)",
        (title, description, json.dumps(ingredients), imageUrl, current_user),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"msg": "Receta creada con éxito"}), 201


@recipes_bp.route("/api/recipes/<int:recipe_id>", methods=["PUT"])
@jwt_required()
def update_recipe(recipe_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    imageUrl = data.get("imageUrl")
    ingredients = data.get("ingredients", {})

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT created_by FROM recipes WHERE id = %s", (recipe_id,))
    recipe = cursor.fetchone()

    if not recipe:
        cursor.close()
        conn.close()
        return jsonify({"msg": "Receta no encontrada"}), 404

    cursor.execute("SELECT role FROM users WHERE username=%s", (current_user,))
    user_role = cursor.fetchone()
    role = user_role.get("role") if user_role else None

    if role != "admin" and recipe["created_by"] != current_user:
        cursor.close()
        conn.close()
        return jsonify({"msg": "No tienes permiso para editar esta receta"}), 403

    cursor.execute(
        "UPDATE recipes SET title=%s, description=%s, ingredients=%s, imageUrl=%s WHERE id=%s",
        (title, description, json.dumps(ingredients), imageUrl, recipe_id),
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"msg": "Receta actualizada con éxito"}), 200


# route to show selected recipe
@recipes_bp.route("/api/recipes/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_recipe(recipe_id):
    current_user = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT created_by FROM recipes WHERE id = %s", (recipe_id,))
    recipe = cursor.fetchone()

    if not recipe:
        cursor.close()
        conn.close()
        return jsonify({"msg": "Receta no encontrada"}), 404

    cursor.execute("SELECT role FROM users WHERE username=%s", (current_user,))
    user_role = cursor.fetchone()
    role = user_role.get("role") if user_role else None

    if role != "admin" and recipe["created_by"] != current_user:
        cursor.close()
        conn.close()
        return jsonify({"msg": "No tienes permiso para borrar esta receta"}), 403

    cursor.execute("DELETE FROM recipes WHERE id = %s", (recipe_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"msg": "Receta eliminada con éxito"}), 200


# register and login
@recipes_bp.route("/register", methods=["POST"])
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


@recipes_bp.route("/login", methods=["POST"])
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

    if not result:
        return jsonify({"msg": "Credenciales inválidas"}), 401

    db_password, db_role = result

    if isinstance(db_password, str):
        db_password = db_password.encode("utf-8")

    if bcrypt.checkpw(password.encode("utf-8"), db_password):
        token = create_access_token(
            identity=str(username), additional_claims={"role": db_role}
        )
        return jsonify(
            {"access_token": token, "user": {"username": username, "role": db_role}}
        ), 200
    else:
        return jsonify({"msg": "Credenciales inválidas"}), 401


@recipes_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"msg": f"Hola {current_user}, estás autenticado!"})


@recipes_bp.route("/create-user", methods=["POST"])
def create_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Faltan datos"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s);",
            (username, hashed_password.decode("utf-8")),
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({"msg": "Usuario creado correctamente!"})
