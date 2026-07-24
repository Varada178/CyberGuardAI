# CyberGuardAI
# 🛡️ CyberGuardAI

> AI-Powered Intelligent Network Intrusion Detection System using Machine Learning and CTGAN

CyberGuardAI is an AI-based cybersecurity system that detects malicious network traffic using Machine Learning models trained on the CICIDS2017 dataset.

The project combines:

- 🤖 Artificial Intelligence
- 🧠 Machine Learning
- 🔥 CTGAN (Conditional Tabular GAN)
- 🌐 Django REST Framework
- ⚛️ React + TypeScript
- 📊 Network Traffic Analysis

---

# 📂 Project Structure

```
CyberGuardAI/
│
├── frontend/
│   └── cyberguard-ai-command/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── ...
│
├── ml_engine/
│   ├── dataset/
│   ├── models/
│   ├── reports/
│   ├── scripts/
│   └── requirements.txt
│
├── backend/
│   (Coming Soon)
│
├── .gitignore
└── README.md
```

---

# 🚀 Technologies Used

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- ShadCN UI

---

## Backend (Upcoming)

- Django
- Django REST Framework
- JWT Authentication

---

## Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- CTGAN
- Matplotlib
- Seaborn

---

# 📥 Clone the Repository

```bash
git clone https://github.com/Varada178/CyberGuardAI.git
```

Go inside the project.

```bash
cd CyberGuardAI
```

---

# 💻 FRONTEND SETUP

Go inside frontend.

```bash
cd frontend/cyberguard-ai-command
```

Install dependencies.

```bash
npm install
```

Run frontend.

```bash
npm run dev
```

Frontend will start on

```
http://localhost:5173
```

---

# 🧠 MACHINE LEARNING SETUP

Open another terminal.

Go inside ML Engine.

```bash
cd CyberGuardAI/ml_engine
```

Create Virtual Environment.

Windows

```bash
python -m venv venv
```

Activate Environment

Windows

```bash
venv\Scripts\activate
```

Linux/Mac

```bash
source venv/bin/activate
```

---

Install Dependencies

```bash
pip install -r requirements.txt
```

Verify Installation

```bash
python --version
```

```bash
pip list
```

---

# 📂 Dataset

This project uses

## CICIDS2017 Dataset

Download:

MachineLearningCSV.zip

Extract it.

Copy all CSV files into

```
ml_engine/dataset/raw/MachineLearningCVE/
```

Expected files:

```
Monday-WorkingHours.pcap_ISCX.csv

Tuesday-WorkingHours.pcap_ISCX.csv

Wednesday-workingHours.pcap_ISCX.csv

Thursday-WorkingHours-Morning-WebAttacks.pcap_ISCX.csv

Thursday-WorkingHours-Afternoon-Infilteration.pcap_ISCX.csv

Friday-WorkingHours-Morning.pcap_ISCX.csv

Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv

Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv
```

---

# ⚙️ Machine Learning Pipeline

Run the following scripts sequentially.

## Step 1

Merge Dataset

```bash
python scripts/01_merge_dataset.py
```

---

## Step 2

Exploratory Data Analysis

```bash
python scripts/02_eda.py
```

---

## Step 3

Data Preprocessing

```bash
python scripts/03_preprocessing.py
```

---

## Step 4

Dataset Analysis

```bash
python scripts/04_data_analysis.py
```

---

## Step 5

Train Test Split

```bash
python scripts/05_train_test_split.py
```

---

## Step 6

Prepare CTGAN Dataset

```bash
python scripts/06_prepare_ctgan_dataset.py
```

---

## Step 7

Train CTGAN Models

```bash
python scripts/07_train_ctgan_models.py
```

---

## Step 8

Generate Synthetic Data

```bash
python scripts/08_generate_synthetic_data.py
```

---

## Step 9

Merge Balanced Dataset

```bash
python scripts/09_merge_balanced_dataset.py
```

---

## Step 10

Feature Selection

```bash
python scripts/10_feature_selection.py
```

---

# 📊 Output Generated

The ML pipeline automatically creates

```
dataset/

reports/

models/
```

including

Merged Dataset

Clean Dataset

Train Dataset

Test Dataset

Balanced Dataset

CTGAN Models

Synthetic Data

EDA Reports

Feature Importance

Analysis Reports

---

# 🔥 Current Project Status

✅ Frontend Completed

✅ Dataset Pipeline Completed

✅ Data Cleaning

✅ EDA

✅ CTGAN Dataset Preparation

✅ CTGAN Model Training

✅ Synthetic Data Generation

✅ Balanced Dataset Generation

✅ Feature Selection

⬜ Machine Learning Model Training

⬜ Django REST Backend

⬜ API Integration

⬜ Deployment

---

# 👥 Team Workflow

## Pull latest changes

```bash
git pull origin main
```

---

## Create new branch

```bash
git checkout -b feature-name
```

Example

```bash
git checkout -b backend-api
```

---

## Add files

```bash
git add .
```

---

## Commit

```bash
git commit -m "Added backend authentication"
```

---

## Push

```bash
git push origin feature-name
```

---

Create Pull Request on GitHub.

---

# 📌 Important Notes

Do NOT upload

```
dataset/

models/

reports/

venv/

node_modules/
```

These are automatically ignored through `.gitignore`.

Only source code should be pushed.

---

# 📜 Future Roadmap

- Random Forest Classifier

- XGBoost

- LightGBM

- CatBoost

- Deep Learning Model

- Explainable AI (XAI)

- Real-time Packet Analysis

- Django REST APIs

- JWT Authentication

- User Dashboard

- Live Threat Monitoring

- Deployment

---

# 👨‍💻 Developed By

Team CyberGuardAI

B.Tech Computer Science & Engineering

Sinhgad Institute of Technology

Pandharpur
