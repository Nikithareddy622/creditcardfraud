import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score
import joblib

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    categories = ['electronics', 'jewelry', 'grocery', 'travel', 'digital_goods', 'gas', 'restaurants', 'clothing']
    spending_patterns = ['normal', 'unusual', 'high_velocity', 'dormant_reactivated']
    locations = ['domestic_same_city', 'domestic_remote', 'international_low_risk', 'international_high_risk']
    device_types = ['mobile_app', 'web_browser', 'pos_terminal', 'unknown_device']
    
    amounts = []
    category_list = []
    pattern_list = []
    freq_list = []
    loc_list = []
    time_list = []
    device_list = []
    fraud_history_list = []
    is_fraud_list = []
    
    for _ in range(num_samples):
        # 90% normal, 10% fraud distribution baseline
        is_fraud = 1 if np.random.rand() < 0.12 else 0
        
        if is_fraud:
            # High risk indicators
            amount = float(np.random.choice([
                np.random.uniform(800, 5000),
                np.random.uniform(1.0, 5.0), # card testing micro-amounts
                np.random.uniform(2500, 10000)
            ]))
            category = np.random.choice(categories, p=[0.35, 0.25, 0.05, 0.20, 0.10, 0.02, 0.01, 0.02])
            pattern = np.random.choice(spending_patterns, p=[0.1, 0.35, 0.40, 0.15])
            freq = int(np.random.randint(8, 35))
            loc = np.random.choice(locations, p=[0.05, 0.25, 0.30, 0.40])
            time_of_day = int(np.random.choice([0, 1, 2, 3, 4, 22, 23])) # late night transactions
            device = np.random.choice(device_types, p=[0.20, 0.25, 0.05, 0.50])
            fraud_history = 1 if np.random.rand() < 0.45 else 0
        else:
            amount = float(np.random.uniform(5, 450))
            category = np.random.choice(categories, p=[0.10, 0.05, 0.30, 0.08, 0.12, 0.15, 0.12, 0.08])
            pattern = np.random.choice(spending_patterns, p=[0.82, 0.12, 0.04, 0.02])
            freq = int(np.random.randint(1, 7))
            loc = np.random.choice(locations, p=[0.75, 0.18, 0.06, 0.01])
            time_of_day = int(np.random.randint(7, 22)) # daytime hours
            device = np.random.choice(device_types, p=[0.45, 0.40, 0.13, 0.02])
            fraud_history = 0 if np.random.rand() < 0.96 else 1
            
        amounts.append(round(amount, 2))
        category_list.append(category)
        pattern_list.append(pattern)
        freq_list.append(freq)
        loc_list.append(loc)
        time_list.append(time_of_day)
        device_list.append(device)
        fraud_history_list.append(fraud_history)
        is_fraud_list.append(is_fraud)
        
    df = pd.DataFrame({
        'amount': amounts,
        'merchantCategory': category_list,
        'cardholderSpendingPattern': pattern_list,
        'transactionFrequency': freq_list,
        'location': loc_list,
        'timeOfDay': time_list,
        'deviceType': device_list,
        'previousFraudHistory': fraud_history_list,
        'isFraud': is_fraud_list
    })
    return df

def train_and_save_model():
    print("Generating synthetic fraud training dataset...")
    df = generate_synthetic_data(6000)
    
    # Feature Encoding
    categorical_cols = ['merchantCategory', 'cardholderSpendingPattern', 'location', 'deviceType']
    encoders = {}
    
    encoded_df = df.copy()
    for col in categorical_cols:
        le = LabelEncoder()
        encoded_df[col] = le.fit_transform(encoded_df[col])
        encoders[col] = le
        
    X = encoded_df.drop(columns=['isFraud'])
    y = encoded_df['isFraud']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    numerical_cols = ['amount', 'transactionFrequency', 'timeOfDay', 'previousFraudHistory']
    
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    
    X_train_scaled[numerical_cols] = scaler.fit_transform(X_train[numerical_cols])
    X_test_scaled[numerical_cols] = scaler.transform(X_test[numerical_cols])
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42, class_weight='balanced')
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    print("\n--- Model Evaluation ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Ensure directory exists
    os.makedirs("model", exist_ok=True)
    
    artifact = {
        'model': model,
        'encoders': encoders,
        'scaler': scaler,
        'feature_names': list(X.columns),
        'categorical_cols': categorical_cols,
        'numerical_cols': numerical_cols
    }
    
    model_path = os.path.join("model", "fraud_model.joblib")
    joblib.dump(artifact, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
