STDOUT:
from flask import Flask, request, jsonify
import jwt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'

# Dummy user data for authentication example
USERS = {
    'testuser': {
        'password': 'testpass'
    }
}

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = USERS.get(username)
    if user and user['password'] == password:
        token = jwt.encode({
            'username': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials'}), 401
