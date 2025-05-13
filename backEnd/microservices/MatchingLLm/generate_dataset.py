import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Number of rows
n = 15000

# Generate numerical features
data = {
    'GPA': np.clip(np.random.normal(3.0, 0.5, n), 0.0, 4.0),
    'Years_Education': np.random.randint(12, 17, n),
    'Prior_Internships': np.random.poisson(0.5, n),
    'Hours_Studied_Weekly': np.clip(np.random.normal(20, 5, n), 5, 40),
    'Technical_Skills_Score': np.clip(np.random.normal(70, 10, n), 0, 100),
    'Soft_Skills_Score': np.clip(np.random.normal(70, 10, n), 0, 100),
    'Work_Experience_Years': np.clip(np.random.exponential(1, n), 0, 5),
    'Extracurricular_Activities': np.random.poisson(2, n),
    'Motivation_Level': np.clip(np.random.normal(70, 10, n), 0, 100),
    'Mentorship_Quality': np.clip(np.random.normal(65, 10, n), 0, 100),
    'Workload_Balance': np.clip(np.random.normal(60, 10, n), 0, 100),
    'Time_Management_Skills': np.clip(np.random.normal(68, 10, n), 0, 100),
    'Team_Collaboration_Score': np.clip(np.random.normal(70, 10, n), 0, 100)
}

# Generate categorical features
data['Major'] = np.random.choice(
    ['Computer Science', 'Engineering', 'Business', 'Arts'],
    n, p=[0.35, 0.30, 0.25, 0.10]
)
data['Internship_Type'] = np.random.choice(
    ['Tech', 'Finance', 'Marketing', 'Research'],
    n, p=[0.40, 0.25, 0.20, 0.15]
)
data['Financial_Aid'] = np.random.choice(['Yes', 'No'], n, p=[0.4, 0.6])

# Create DataFrame
df = pd.DataFrame(data)

# Define numerical columns
numerical_cols = [
    'GPA', 'Years_Education', 'Prior_Internships', 'Hours_Studied_Weekly',
    'Technical_Skills_Score', 'Soft_Skills_Score', 'Work_Experience_Years',
    'Extracurricular_Activities', 'Motivation_Level', 'Mentorship_Quality',
    'Workload_Balance', 'Time_Management_Skills', 'Team_Collaboration_Score'
]

# Standardize numerical features
for col in numerical_cols:
    df[col + '_std'] = (df[col] - df[col].mean()) / df[col].std()

# Generate target variable (Internship_Completed)
logit = (
    0.55 * df['GPA_std'] +
    0.55 * df['Years_Education_std'] +
    0.55 * df['Prior_Internships_std'] +
    0.55 * df['Hours_Studied_Weekly_std'] +
    0.55 * df['Technical_Skills_Score_std'] +
    0.55 * df['Soft_Skills_Score_std'] +
    0.55 * df['Work_Experience_Years_std'] +
    0.55 * df['Extracurricular_Activities_std'] +
    0.55 * df['Motivation_Level_std'] +
    0.55 * df['Mentorship_Quality_std'] +
    0.55 * df['Workload_Balance_std'] +
    0.55 * df['Time_Management_Skills_std'] +
    0.55 * df['Team_Collaboration_Score_std']
)

# Add noise
noise = np.random.normal(0, 0.5, n)
logit += noise

# Adjust intercept for ~50% completion rate
intercept = -np.mean(logit)
logit += intercept

# Calculate probability and assign binary outcome
prob = 1 / (1 + np.exp(-logit))
df['Internship_Completed'] = (prob > 0.5).astype(int)

# Introduce ~5% missing values in selected columns
for col in ['GPA', 'Hours_Studied_Weekly', 'Work_Experience_Years', 'Mentorship_Quality', 'Time_Management_Skills']:
    mask = np.random.random(n) < 0.05
    df.loc[mask, col] = np.nan

# Drop standardized columns as they are only used for target generation
df = df.drop([col + '_std' for col in numerical_cols], axis=1)

# Save the dataset to an Excel file
df.to_excel('internship_completion_dataset.xlsx', index=False)
print("Dataset with 5000 rows saved as 'internship_completion_dataset.xlsx'")