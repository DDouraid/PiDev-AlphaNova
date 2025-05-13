# train_and_save_model.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.cluster import KMeans
import joblib

# Load and preprocess the dataset
df = pd.read_csv("Admission_Predict_Ver1.1.csv")
df = df.drop(columns=['Serial No.'])

# Define numerical columns (excluding the target)
numerical_cols = [col for col in df.select_dtypes(include=['float64', 'int64']).columns if col != 'Chance of Admit ']

# Handle missing values
for col in numerical_cols:
    df[col].fillna(df[col].median(), inplace=True)

# Normalize numerical features
scaler = StandardScaler()
df[numerical_cols] = scaler.fit_transform(df[numerical_cols])

# Compute correlation matrix and select features
corr_matrix = df.corr()
target = 'Chance of Admit '
correlation_threshold = 0.1
target_corr = corr_matrix[target].abs()
selected_features = target_corr[target_corr > correlation_threshold].index.tolist()
if target in selected_features:
    selected_features.remove(target)

# Prepare data for training
X = df[selected_features]
y = (df['Chance of Admit '] > 0.5).astype(int)  # Binarize target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train multiple models and select the best
models = {
    'KNN': KNeighborsClassifier(n_neighbors=5),
    'SVM': SVC(kernel='linear', random_state=42, probability=True),
    'DecisionTree': DecisionTreeClassifier(random_state=42, max_depth=4),
    'XGBoost': XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='logloss')
}

best_accuracy = 0
best_classifier = None

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"{name} Accuracy: {accuracy:.4f}")
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_classifier = model

# Calibrate the best classifier
calibrated_classifier = CalibratedClassifierCV(best_classifier, method='sigmoid', cv=5)
calibrated_classifier.fit(X_train, y_train)

# Train K-Means for university recommendation
optimal_k = 4  # From the notebook
kmeans = KMeans(n_clusters=optimal_k, init='k-means++', n_init=12, random_state=42)
kmeans.fit(X)

# Save the models and scaler
joblib.dump(calibrated_classifier, 'calibrated_model.joblib')
joblib.dump(scaler, 'scaler.joblib')
joblib.dump(selected_features, 'selected_features.joblib')
joblib.dump(kmeans, 'kmeans_model.joblib')

print("Models, scaler, and selected features saved successfully.")