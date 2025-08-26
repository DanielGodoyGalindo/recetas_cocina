import mysql.connector
from mysql.connector import Error

# Personal project developed by Daniel Godoy
# https://github.com/DanielGodoyGalindo

# mysql connection
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost", user="root", password="root", database="recipesapp"
        )
        return conn
    except Error as err:
        print(f"Error al conectarse a la base de datos: {err}")
        raise
