from ultralytics import YOLO
import os

# -----------------------------
# STEP 1: Load Pretrained YOLOv8 Model
# -----------------------------
model = YOLO("yolov8n.pt")  # You can use yolov8s.pt for better accuracy

# -----------------------------
# STEP 2: Define YOLO Label to Custom Category Mapping
# -----------------------------
category_map = {
    "book": "Textbooks",
    "laptop": "Electronics",
    "cell phone": "Electronics",
    "keyboard": "Electronics",
    "mouse": "Electronics",
    "tv": "Electronics",
    "remote": "Electronics",
    "chair": "Furniture",
    "couch": "Furniture",
    "bed": "Furniture",
    "bicycle": "Transportation",
    "backpack": "Accessories",
    "handbag": "Accessories",
    "suitcase": "Accessories",
    "bottle": "Food & Drinks",
    "cup": "Food & Drinks",
    "wine glass": "Food & Drinks",
    "teddy bear": "Miscellaneous",
    "tie": "Clothing",
    "shirt": "Clothing",
    "person": "Clothing",  # if wearing something
}

# -----------------------------
# STEP 3: Define Function to Categorize Image
# -----------------------------
def categorize_product(image_path):
    results = model(image_path)[0]
    detections = results.boxes

    print(f"\nDetected objects in {image_path}:")
    category_counts = {}

    for box in detections:
        class_id = int(box.cls[0].item())
        label = results.names[class_id]
        confidence = float(box.conf[0].item())
        print(label)
        if confidence < 0.5:
            continue

        category = category_map.get(label, "Miscellaneous")
        category_counts[category] = category_counts.get(category, 0) + 1

        print(f" - {label} ({confidence:.2f}) → Category: {category}")

    if category_counts:
        # Return the most frequent detected category
        best_category = max(category_counts, key=category_counts.get)
    else:
        best_category = "Miscellaneous"

    print(f"\n📦 Final Category for Product: {best_category}")
    return best_category

# -----------------------------
# STEP 4: Test
# -----------------------------
if __name__ == "__main__":
    image_path = "download.jpg"  # Replace with uploaded file path
    if os.path.exists(image_path):
        categorize_product(image_path)
    else:
        print("❌ Image file not found.")
