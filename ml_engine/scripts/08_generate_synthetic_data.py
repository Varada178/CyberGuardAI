from pathlib import Path
import pandas as pd
import joblib
import logging

# =====================================================
# Logging
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# =====================================================
# Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = BASE_DIR / "models" / "ctgan"

PLAN_FILE = BASE_DIR / "reports" / "data_analysis" / "ctgan_plan.csv"

OUTPUT_DIR = BASE_DIR / "dataset" / "synthetic"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# =====================================================
# Load Plan
# =====================================================

plan = pd.read_csv(PLAN_FILE)

plan = plan[plan["Strategy"] == "CTGAN"]

print("\nCTGAN Generation Plan\n")
print(plan)

# =====================================================
# Generate Data
# =====================================================

for _, row in plan.iterrows():

    attack = row["Attack"]

    required = int(row["Synthetic Required"])

    if required <= 0:
        continue

    model_name = attack.replace(" ", "_").replace("-", "_") + ".pkl"

    model_path = MODEL_DIR / model_name

    if not model_path.exists():

        logging.warning(f"Model not found : {model_name}")

        continue

    logging.info("=" * 60)
    logging.info(f"Generating : {attack}")
    logging.info(f"Required Samples : {required}")

    model = joblib.load(model_path)

    synthetic = model.sample(required)

    synthetic["Label"] = attack

    output_file = OUTPUT_DIR / f"{model_name.replace('.pkl','.csv')}"

    synthetic.to_csv(output_file, index=False)

    logging.info(f"Saved : {output_file}")
    logging.info(f"Shape : {synthetic.shape}")

logging.info("=" * 60)
logging.info("SYNTHETIC DATA GENERATION COMPLETED")
logging.info("=" * 60)