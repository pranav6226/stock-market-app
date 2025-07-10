from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Default theme
user_themes = {}

@app.route('/api/theme', methods=['GET', 'POST'])
def theme():
    if request.method == 'POST':
        data = request.json
        user_id = data.get('user_id')
        theme = data.get('theme')
        if theme not in ['light', 'dark']:
            return jsonify({'error': 'Invalid theme'}), 400
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        user_themes[user_id] = theme
        return jsonify({'message': 'Theme updated successfully'})
    else:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        theme = user_themes.get(user_id, 'light')
        return jsonify({'theme': theme})

if __name__ == '__main__':
    app.run(debug=True)
