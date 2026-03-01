from flask import Flask, request, jsonify
from flask_cors import CORS
from pedersen import PedersenCommitmentSystem
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path=''):
    return '', 204

# Initialize commitment system
commitment_system = PedersenCommitmentSystem()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "ZenLend Commitment API"})

@app.route('/generate-commitment', methods=['POST'])
def generate_commitment():
    """Generate Pedersen commitment and proof"""
    try:
        data = request.get_json()
        
        if not data or 'amount' not in data or 'private_key' not in data:
            return jsonify({"error": "Missing required fields: amount, private_key"}), 400
        
        amount = data['amount']
        private_key = data['private_key']
        
        # Validate inputs
        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({"error": "Amount must be a positive number"}), 400
        
        if not isinstance(private_key, str) or len(private_key) < 8:
            return jsonify({"error": "Private key must be at least 8 characters"}), 400
        
        # Generate commitment and proof
        commitment, proof = commitment_system.generate_commitment_with_proof(amount, private_key)
        
        logger.info(f"Generated commitment for amount: {amount}")
        
        return jsonify({
            "commitment": commitment,
            "proof": proof,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error generating commitment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/verify-proof', methods=['POST'])
def verify_proof():
    """Verify commitment proof"""
    try:
        data = request.get_json()
        
        required_fields = ['commitment', 'proof', 'amount']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing required fields: {required_fields}"}), 400
        
        commitment = data['commitment']
        proof = data['proof']
        amount = data['amount']
        
        # Verify the proof
        is_valid = commitment_system.verify_proof(commitment, proof, amount)
        
        logger.info(f"Proof verification result: {is_valid}")
        
        return jsonify({
            "valid": is_valid,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error verifying proof: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/info', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        "name": "ZenLend Commitment API",
        "version": "1.0.0",
        "description": "Private Bitcoin lending commitment generation service",
        "endpoints": {
            "/health": "Health check",
            "/generate-commitment": "Generate Pedersen commitment and proof",
            "/verify-proof": "Verify commitment proof",
            "/api/info": "API information"
        }
    })

if __name__ == '__main__':
    print("🚀 Starting ZenLend Commitment API...")
    print("📡 Serving on http://localhost:5000")
    print("📚 API docs available at http://localhost:5000/api/info")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )