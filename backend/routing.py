from flask_cors import CORS
from db import get_db_connection
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import bcrypt
import json
import os
import google.generativeai as genai
from flask import jsonify, request, Blueprint
import mysql.connector
from dotenv import load_dotenv
from mysql.connector import IntegrityError
from werkzeug.utils import secure_filename


# create Blueprint object
# https://flask.palletsprojects.com/en/stable/blueprints/
recipes_bp = Blueprint("recipes", __name__)
CORS(recipes_bp)

# https://ai.google.dev/gemini-api/docs/quickstart?hl=es-419
load_dotenv(".env.development.local")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Google API Key not found.")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-flash")


### Routing ###
# Recipes
@recipes_bp.route("/api/recipes", methods=["GET"])
def get_recipes():
    search = request.args.get("search", "")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT id, title, description, ingredients, imagePath, created_by 
        FROM recipes
        WHERE title LIKE %s OR created_by LIKE %s OR ingredients LIKE %s
    """
    like = f"%{search}%"
    cursor.execute(query, (like, like, like))
    recipes = cursor.fetchall()
    for recipe in recipes:
        recipe["ingredients"] = (
            json.loads(recipe["ingredients"]) if recipe["ingredients"] else {}
        )
    cursor.close()
    conn.close()
    return jsonify(recipes)


@recipes_bp.route("/api/recipes/<int:recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, title, description, ingredients, imagePath, created_by FROM recipes WHERE id = %s",
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
    title = request.form.get("title")
    description = request.form.get("description")
    created_by = request.form.get("created_by")

    ingredients = json.loads(request.form.get("ingredients", "{}"))
    steps = json.loads(request.form.get("steps", "[]"))
    image = request.files.get("image")
    imagePath = None
    if image:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        upload_folder = os.path.join(project_root, "public", "img", "recipes")
        os.makedirs(upload_folder, exist_ok=True)
        filename = secure_filename(image.filename)
        save_path = os.path.join(upload_folder, filename)
        image.save(save_path)
        imagePath = f"img/recipes/{filename}"

    # database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO recipes (title, description, ingredients, imagePath, created_by)
        VALUES (%s, %s, %s, %s, %s)
    """,
        (
            title,
            description,
            json.dumps(ingredients, ensure_ascii=False),
            imagePath,
            created_by,
        ),
    )
    recipe_id = cursor.lastrowid

    for i, step in enumerate(steps, start=1):
        instruction = step.get("instruction")
        duration_min = step.get("duration_min")

        cursor.execute(
            """
            INSERT INTO recipe_steps (recipe_id, position, instruction, duration_min)
            VALUES (%s, %s, %s, %s)
        """,
            (recipe_id, i, instruction, duration_min),
        )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Receta creada con éxito!", "recipe_id": recipe_id}), 201


@recipes_bp.route("/api/recipes/<int:recipe_id>", methods=["PUT"])
@jwt_required()
def update_recipe(recipe_id):
    current_user = get_jwt_identity()

    title = request.form.get("title")
    description = request.form.get("description")
    ingredients = json.loads(request.form.get("ingredients", "{}"))
    steps = json.loads(request.form.get("steps", "[]"))

    image = request.files.get("image")
    imagePath = None
    if image:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        upload_folder = os.path.join(project_root, "public", "img", "recipes")
        os.makedirs(upload_folder, exist_ok=True)
        filename = secure_filename(image.filename)
        save_path = os.path.join(upload_folder, filename)
        image.save(save_path)
        imagePath = f"img/recipes/{filename}"

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM recipes WHERE id = %s", (recipe_id,))
    recipe = cursor.fetchone()
    if not recipe:
        cursor.close()
        conn.close()
        return jsonify({"msg": "Receta no encontrada!"}), 404

    # Verificar permisos
    if current_user["role"] != "admin" and recipe["created_by"] != current_user["id"]:
        cursor.close()
        conn.close()
        return jsonify({"msg": "No tienes permiso para editar esta receta"}), 403

    # Actualizar receta (solo campos enviados)
    update_fields = []
    update_values = []

    if title is not None:
        update_fields.append("title=%s")
        update_values.append(title)
    if description is not None:
        update_fields.append("description=%s")
        update_values.append(description)
    if ingredients:
        update_fields.append("ingredients=%s")
        update_values.append(json.dumps(ingredients, ensure_ascii=False))
    if imagePath:
        update_fields.append("imagePath=%s")
        update_values.append(imagePath)

    if update_fields:  # solo ejecuta si hay algo que actualizar
        query = f"UPDATE recipes SET {', '.join(update_fields)} WHERE id=%s"
        update_values.append(recipe_id)
        cursor.execute(query, tuple(update_values))

    # Actualizar pasos (si fueron enviados)
    if steps:
        cursor.execute("DELETE FROM recipe_steps WHERE recipe_id = %s", (recipe_id,))
        for i, step in enumerate(steps, start=1):
            instruction = step.get("instruction")
            duration_min = step.get("duration_min")
            cursor.execute(
                """
                INSERT INTO recipe_steps (recipe_id, position, instruction, duration_min)
                VALUES (%s, %s, %s, %s)
                """,
                (recipe_id, i, instruction, duration_min),
            )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"msg": "Receta actualizada con éxito!!"}), 200


# route to delete selected recipe
@recipes_bp.route("/api/recipes/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_recipe(recipe_id):
    current_user = get_jwt_identity()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # get recipe
        print(recipe_id)
        cursor.execute("SELECT * FROM recipes WHERE id = %s", (recipe_id,))
        recipe = cursor.fetchone()
        print(recipe)
        if not recipe:
            return jsonify({"msg": "Receta no encontrada"}), 404

        # check if user is allowed
        if (
            current_user["role"] != "admin"
            and recipe["created_by"] != current_user["username"]
        ):
            return jsonify({"msg": "No tienes permiso para borrar esta receta"}), 403

        # delete
        cursor.execute("DELETE FROM recipes WHERE id = %s", (recipe_id,))
        conn.commit()
        return jsonify({"msg": "Receta eliminada con éxito"}), 200

    finally:
        # close connection
        cursor.close()
        conn.close()


# Comments
@recipes_bp.route("/api/recipes/<int:recipe_id>/comments", methods=["GET"])
def get_comments(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT c.id, c.text_comment, c.vote, u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.recipe_id = %s
    """,
        (recipe_id,),
    )
    comments = cursor.fetchall()
    cursor.close()
    conn.close()

    if not comments:
        return jsonify([]), 200

    return jsonify(comments), 200


# Personal project developed by Daniel Godoy
# https://github.com/DanielGodoyGalindo


@recipes_bp.route("/api/recipes/<int:recipe_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(recipe_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    text_comment = data.get("text_comment")
    vote = data.get("vote")
    print("text_comment", text_comment)

    # Validation
    if not text_comment:
        return jsonify({"error": "El comentario es obligatorio"}), 400

    if not isinstance(vote, int) or vote < 1 or vote > 5:
        return jsonify({"error": "El voto debe estar entre 1 y 5"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM recipes WHERE id=%s", (recipe_id,))
    recipe = cursor.fetchone()
    if not recipe:
        cursor.close()
        conn.close()
        return jsonify({"error": "Receta no encontrada"}), 404

    cursor.execute("SELECT username FROM users WHERE id=%s", (current_user["id"],))
    user_row = cursor.fetchone()
    if not user_row:
        cursor.close()
        conn.close()
        return jsonify({"error": "Usuario no encontrado"}), 404

    username = user_row["username"]

    if recipe["created_by"] == username and current_user["role"] != "admin":
        cursor.close()
        conn.close()
        return jsonify({"error": "No puedes comentar tu propia receta"}), 403

    try:
        cursor.execute(
            "INSERT INTO comments (text_comment, vote, recipe_id, user_id) VALUES (%s, %s, %s, %s)",
            (text_comment, vote, recipe_id, current_user["id"]),
        )
        conn.commit()
        comment_id = cursor.lastrowid
        cursor.execute(
            "SELECT c.id, c.text_comment, c.vote, u.username "
            "FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = %s",
            (comment_id,),
        )
        new_comment = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify(
            {"msg": "¡Comentario añadido con éxito!", "new_comment": new_comment}
        ), 201

    except IntegrityError as e:
        conn.rollback()
        if e.errno == 1062:
            return jsonify({"msg": "Ya has comentado esta receta"}), 400
        else:
            return jsonify({"msg": "Error de base de datos"}), 500


@recipes_bp.route(
    "/api/recipes/<int:recipe_id>/comments/delete/<int:comment_id>", methods=["DELETE"]
)
@jwt_required()
def delete_comment(recipe_id, comment_id):
    current_user = get_jwt_identity()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT * FROM comments WHERE id = %s AND recipe_id = %s",
            (comment_id, recipe_id),
        )
        comment = cursor.fetchone()

        if not comment:
            return jsonify({"msg": "¡Comentario no encontrado!"}), 404

        if current_user["id"] != comment["user_id"] and current_user["role"] != "admin":
            return jsonify(
                {"msg": "¡No tienes permisos para borrar el comentario!"}
            ), 403

        cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
        conn.commit()

        return jsonify({"msg": "¡Comentario eliminado!"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"msg": f"Error al borrar el comentario: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()


@recipes_bp.route("/api/comments/<int:comment_id>", methods=["PUT"])
@jwt_required()
def update_comment(comment_id):
    current_user = get_jwt_identity()
    data = request.get_json()

    new_text = data.get("text_comment")
    new_vote = data.get("vote")

    if not isinstance(new_text, str) or not new_text.strip():
        return jsonify({"error": "El comentario debe ser un texto válido"}), 422
    if not isinstance(new_vote, int) or new_vote < 1 or new_vote > 5:
        return jsonify({"error": "El voto debe estar entre 1 y 5"}), 422

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM comments WHERE id=%s", (comment_id,))
        comment = cursor.fetchone()
        # validation
        if not comment:
            return jsonify({"error": "Comentario no encontrado"}), 404
        if current_user["id"] != comment["user_id"]:
            return jsonify(
                {"error": "No tienes permisos para editar este comentario"}
            ), 403

        cursor.execute(
            "UPDATE comments SET text_comment=%s, vote=%s WHERE id=%s",
            (new_text.strip(), new_vote, comment_id),
        )
        conn.commit()
        return jsonify({"msg": "Comentario actualizado!"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify(
            {"error": "Error al actualizar comentario", "detail": str(e)}
        ), 500

    finally:
        cursor.close()
        conn.close()


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
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"msg": "Credenciales inválidas"}), 401

    db_password = user["password"]
    if isinstance(db_password, str):
        db_password = db_password.encode("utf-8")

    if bcrypt.checkpw(password.encode("utf-8"), db_password):
        token = create_access_token(
            identity={
                "id": user["id"],
                "username": user["username"],
                "role": user["role"],
            }
        )
        return jsonify(
            {
                "access_token": token,
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "role": user["role"],
                },
            }
        ), 200
    else:
        return jsonify({"msg": "Credenciales inválidas"}), 401


@recipes_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"msg": f"Hola {current_user['username']}, estás autenticado!"})


# Personal project developed by Daniel Godoy
# https://github.com/DanielGodoyGalindo


# Users
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


# Recipe Steps
@recipes_bp.route("/api/recipes/<int:recipe_id>/steps", methods=["GET"])
def get_recipe_steps(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, recipe_id, position, instruction, duration_min
        FROM recipe_steps
        WHERE recipe_id = %s
        ORDER BY position ASC
    """,
        (recipe_id,),
    )

    steps = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(steps)


# User's favorite recipes
@recipes_bp.route("/api/recipes/favorites", methods=["POST"])
@jwt_required()
def add_favorite():
    user = get_jwt_identity()
    recipe_id = request.json.get("recipe_id")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "INSERT INTO user_favorites (user_id, recipe_id) VALUES (%s, %s)",
        (user["id"], recipe_id),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Receta añadida a favoritos"}), 201


@recipes_bp.route("/api/recipes/favorites/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(recipe_id):
    user = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "DELETE FROM user_favorites WHERE user_id = %s AND recipe_id = %s",
        (user["id"], recipe_id),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Receta eliminada de favoritos"}), 200


@recipes_bp.route("/api/recipes/favorites", methods=["GET"])
@jwt_required()
def get_favorites():
    user = get_jwt_identity()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT r.id, r.title, r.created_by
        FROM recipes r
        INNER JOIN user_favorites uf ON r.id = uf.recipe_id
        WHERE uf.user_id = %s
        """,
        (user["id"],),
    )
    favorites = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(favorites), 200


@recipes_bp.route("/api/recipes/favorites/<int:recipe_id>/check", methods=["GET"])
@jwt_required()
def check_favorite(recipe_id):
    user = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT 1 FROM user_favorites WHERE user_id = %s AND recipe_id = %s",
        (user["id"], recipe_id),
    )
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    # return true / false
    is_favorite = bool(result)
    return jsonify({"is_favorite": is_favorite}), 200


@recipes_bp.route("/api/recipes/generate_recipe", methods=["POST"])
@jwt_required()
def generate_recipe():
    data = request.get_json()
    ingredients = data.get("ingredients", "")
    ingredients_list = [i.strip().lower() for i in ingredients.split(",") if i.strip()]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, title, ingredients FROM recipes")
    all_recipes = cursor.fetchall()
    cursor.close()
    conn.close()

    resultados = []

    for receta in all_recipes:
        try:
            ing_json = json.loads(receta["ingredients"])
        except Exception:
            continue

        receta_ingredientes = [k.lower() for k in ing_json.keys()]

        if all(ing in receta_ingredientes for ing in ingredients_list):
            resultados.append({"id": receta["id"], "title": receta["title"]})

    return jsonify(resultados)


@recipes_bp.route("/api/recipes/generate_ai_recipe", methods=["POST"])
@jwt_required()
def generate_ai_recipe():
    data = request.get_json()
    ingredients = data.get("ingredients", "")

    if not ingredients:
        return jsonify({"error": "No se han proporcionado ingredientes."}), 400

    prompt = (
        "Eres un chef experto. Devuelve una lista de 3 recetas en formato JSON. "
        "Cada receta debe tener los campos: id (número), title, ingredients (lista de strings), "
        "steps (lista de strings). El JSON debe ser una lista de objetos. No devuelvas nada de texto extra fuera del JSON. "
        "Sugiere recetas que se puedan preparar con estos ingredientes: "
        f"{ingredients}"
    )

    try:
        response = model.generate_content(prompt)
        content = response.text
        if content.startswith("```json"):
            content = content[7:-3].strip()
        try:
            recipes = json.loads(content)
        except json.JSONDecodeError as e:
            print("Error parseando JSON:", e)
            print("Contenido recibido de la IA:", content)
            return jsonify({"error": "Formato de respuesta inesperado de la IA."}), 500

        if not isinstance(recipes, list) or not recipes:
            return jsonify(
                {"error": "La IA no devolvió un formato de lista válido."}
            ), 500

        return jsonify(recipes)

    except Exception as e:
        print("Error llamando a Gemini:", e)
        return jsonify({"error": f"Error generando recetas con IA: {str(e)}"}), 500
