from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:felios123@localhost/web"
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    email = db.Column(db.String(50))
    password = db.Column(db.String(50))

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    new_user = User(
        name=data["username"],
        email=data["email"],
        password=data["password"]
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify(success=True), 200

if __name__ == '__main__':
    app.run(debug=True)
