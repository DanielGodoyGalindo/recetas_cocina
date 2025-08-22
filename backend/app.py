from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routing import recipes_bp

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "clave-super-secreta"

CORS(app)
jwt = JWTManager(app)
app.register_blueprint(recipes_bp)

if __name__ == "__main__":
    app.run(debug=True)
