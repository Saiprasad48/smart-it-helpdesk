from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "ticket_category_model.joblib"

def predict_ticket_category(title: str, description: str) -> str:
    if not MODEL_PATH.exists():
        return "Other"
    model = joblib.load(MODEL_PATH)
    ticket_text = f"{title} {description}"
    prediction = model.predict([ticket_text])[0]
    return prediction