from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/match', methods=['POST'])
def match():
    data = request.json
    offers = data['offers']
    results = [{'offerId': offer['id'], 'matchScore': 0.7 + (i * 0.1)} for i, offer in enumerate(offers)]
    return jsonify(results)

if __name__ == '__main__':
    app.run(port=4700)