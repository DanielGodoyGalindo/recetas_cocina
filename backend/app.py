from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager # https://flask-jwt-extended.readthedocs.io/en/stable/
from routing import recipes_bp # import Blueprint object

# Main app file. Execute to get app working

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "clave-super-secreta"

CORS(app)
jwt = JWTManager(app) # JSON Web Token
app.register_blueprint(recipes_bp) # register Blueprint

if __name__ == "__main__":
    app.run(debug=True)
