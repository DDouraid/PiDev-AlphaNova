from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load the saved models, scaler, and selected features
model = joblib.load('calibrated_model.joblib')
scaler = joblib.load('scaler.joblib')
kmeans = joblib.load('kmeans_model.joblib')
selected_features = joblib.load('selected_features.joblib')

# Trim any trailing or leading spaces from feature names
selected_features = [feature.strip() for feature in selected_features]
print("Trimmed selected features:", selected_features)  # Debug log to verify

# University types mapping
university_types = {
    0: "Lower-Tier University (Supportive Admission Policies)",
    1: "Mid-Tier University (Moderate Admission Standards)",
    2: "Top-Tier University (High Academic Requirements)",
    3: "Specialized University (Focus on Specific Strengths)"
}

# Thresholds for "good" feature values
GOOD_THRESHOLDS = {
    "GRE Score": 320,
    "TOEFL Score": 105,
    "University Rating": 4,
    "SOP": 4.0,
    "LOR": 4.0,
    "CGPA": 8.5,
    "Research": 1
}

def generate_advice(admission_features, admission_status, prob, cluster):
    advice_list = []

    if admission_status == "No":
        advice_list.append("Your admission probability is low ({}%). Here are some areas to improve:".format(round(prob * 100, 2)))
        for feature, value in admission_features.items():
            threshold = GOOD_THRESHOLDS.get(feature)
            if threshold is not None:
                if feature == "Research" and value < threshold:
                    advice_list.append("- Gain research experience (e.g., work on a research project, publish a paper) to strengthen your profile.")
                elif feature != "Research" and value < threshold:
                    advice_list.append(f"- Improve your {feature} (current: {value}). Aim for at least {threshold} to be more competitive.")
        if prob < 0.3:
            advice_list.append("- Consider applying to universities with more lenient admission policies (e.g., cluster 0) while working on your profile.")
    else:
        advice_list.append("Congratulations! You have a good chance of admission ({}%). Here are some tips to aim for top-tier universities:".format(round(prob * 100, 2)))
        for feature, value in admission_features.items():
            threshold = GOOD_THRESHOLDS.get(feature)
            if threshold is not None:
                if feature == "Research" and value < threshold and cluster < 2:
                    advice_list.append("- Adding research experience could help you target top-tier universities (cluster 2).")
                elif feature != "Research" and value < threshold and cluster < 2:
                    advice_list.append(f"- Your {feature} (current: {value}) is decent but below the top-tier threshold ({threshold}). Improving it could help you target cluster 2 universities.")
        if cluster >= 2:
            advice_list.append("- Your profile is strong for top-tier universities. Maintain your academic and extracurricular achievements!")

    return advice_list

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request (CvDataDto-like structure)
        cv_data = request.get_json()
        print("Received CV data:", cv_data)  # Debug log to verify payload

        # Validate input data
        if not cv_data:
            return jsonify({'error': 'No CV data provided'}), 400

        # Extract admission features directly from the JSON (already parsed by PdfParserUtil)
        admission_features = {
            "GRE Score": cv_data.get('greScore', 300.0),
            "TOEFL Score": cv_data.get('toeflScore', 100.0),
            "University Rating": cv_data.get('universityRating', 3.0),
            "SOP": cv_data.get('sop', 3.0),
            "LOR": cv_data.get('LOR', 3.0),
            "CGPA": cv_data.get('cgpa', 7.0),
            "Research": cv_data.get('research', 0)
        }
        print("Extracted admission features:", admission_features)  # Debug log

        # Validate that all required features are present
        for feature in selected_features:
            if feature not in admission_features:
                return jsonify({'error': f'Missing admission feature: {feature}'}), 400

        # Extract feature values in the correct order
        input_data = [admission_features[feature] for feature in selected_features]
        input_data = np.array(input_data).reshape(1, -1)

        # Scale the input data
        input_data_scaled = scaler.transform(input_data)

        # Predict probability of admission
        prob = model.predict_proba(input_data_scaled)[0, 1]  # Probability of admission (class 1)

        # Determine admission status
        admitted = prob > 0.5
        admission_status = "Yes" if admitted else "No"

        # Predict university recommendation using K-Means
        cluster = kmeans.predict(input_data_scaled)[0]
        recommended_university = university_types[cluster]

        # Generate advice for the student
        advice = generate_advice(admission_features, admission_status, prob, cluster)
        print("Generated advice:", advice)  # Debug log to verify advice

        # Prepare response
        response = {
            'admitted': admission_status,
            'probability': round(prob * 100, 2),
            'recommended_university': recommended_university,
            'cluster': int(cluster),
            'advice': advice
        }
        print("Response being sent:", response)  # Debug log to verify response

        return jsonify(response), 200

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)