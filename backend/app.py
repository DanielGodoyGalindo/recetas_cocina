from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
)  # https://flask-jwt-extended.readthedocs.io/en/stable/
from routing import recipes_bp  # import Blueprint object

# Main app file. Execute to get app working

# Personal project developed by Daniel Godoy
# https://github.com/DanielGodoyGalindo

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "clave-super-secreta"
# https://flask-jwt-extended.readthedocs.io/en/stable/refreshing_tokens.html
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)

CORS(app)
jwt = JWTManager(app)  # JSON Web Token
app.register_blueprint(recipes_bp)  # register Blueprint


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify(
        {"msg": "El token ha caducado. Por favor inicia sesión de nuevo."}
    ), 401


if __name__ == "__main__":
    app.run(debug=True)
