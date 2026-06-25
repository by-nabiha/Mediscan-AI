import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

# 1. Define the CNN Architecture for Skin Lesion Classification
class SkinLesionCNN(nn.Module):
    def __init__(self, num_classes=7):
        super(SkinLesionCNN, self).__init__()
        # Convolutional layers
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2, 2), # 64x64 -> 32x32
            
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2), # 32x32 -> 16x16
            
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2)  # 16x16 -> 8x8
        )
        # Fully connected layers
        self.classifier = nn.Sequential(
            nn.Linear(64 * 8 * 8, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes) # Outputs logits
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

# Labels mapping
SKIN_CLASSES = [
    "Normal",
    "Eczema",
    "Psoriasis",
    "Fungal infection",
    "Melanoma",
    "Melanocytic nevus",
    "Seborrheic keratosis"
]

# 2. Advanced Multi-Diagnosis Inference Logic (Softmax + 30% Floor + Uncertainty Handling)
def predict_skin_lesion(model, image_tensor, confidence_floor=0.30):
    """
    Inference helper implementing the requested multi-condition logic:
    - Runs softmax across the classes (sums to 100%).
    - Reports all classes above a confidence floor (30%).
    - Labels output as 'possible X or Y — uncertain, recommend in-person exam' if close classes exist.
    """
    model.eval()
    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.softmax(logits, dim=1).squeeze().numpy()
        
    # Map predictions with class labels
    predictions = {SKIN_CLASSES[i]: float(probabilities[i]) for i in range(len(SKIN_CLASSES))}
    
    # Sort predictions by probability descending
    sorted_preds = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
    
    # Filter predictions above the 30% confidence floor
    above_floor = [(label, prob) for label, prob in sorted_preds if prob >= confidence_floor]
    
    # Multi-condition comparison: check if the top 2 conditions are close (within 15% margin of difference)
    is_uncertain = False
    status_message = ""
    
    if len(above_floor) >= 2:
        top_1_label, top_1_prob = above_floor[0]
        top_2_label, top_2_prob = above_floor[1]
        
        # If the gap between top probabilities is small, mark as uncertain/overlapping
        if (top_1_prob - top_2_prob) <= 0.15:
            is_uncertain = True
            status_message = f"possible {top_1_label} or {top_2_label} — uncertain, recommend in-person exam"
    
    if not status_message:
        if len(above_floor) > 0:
            status_message = f"Dominant finding: {above_floor[0][0]} ({above_floor[0][1]*100:.1f}%)"
        else:
            status_message = "Normal / No specific anomalies detected"

    return {
        "all_probabilities": predictions,
        "findings_above_floor": above_floor,
        "is_uncertain": is_uncertain,
        "status_message": status_message
    }

# 3. Simulate Training Loop with Synthetic Clinical Lesion Data
def train_model():
    print("Generating synthetic skin lesion datasets...")
    # Create 200 random RGB images (3 channels, 64x64)
    x_train = torch.randn(200, 3, 64, 64)
    # Generate labels (0 to 6)
    y_train = torch.randint(0, 7, (200,))
    
    dataset = TensorDataset(x_train, y_train)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    model = SkinLesionCNN(num_classes=7)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    print("Training Skin Lesion CNN Model...")
    model.train()
    for epoch in range(1, 6):
        total_loss = 0.0
        for batch_x, batch_y in loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch {epoch}/5 - Loss: {total_loss/len(loader):.4f}")
        
    # Save model weights
    os.makedirs("models", exist_ok=True)
    torch.save(model.state_dict(), "models/skin_lesion_model.pth")
    print("Model successfully trained and saved to 'models/skin_lesion_model.pth'.")
    
    # Run test prediction
    test_img = torch.randn(1, 3, 64, 64)
    res = predict_skin_lesion(model, test_img)
    print("\nSample Test Output:")
    print("All Softmax Probabilities:")
    for cls, val in res["all_probabilities"].items():
        print(f"  {cls}: {val*100:.2f}%")
    print(f"Findings above 30% floor: {res['findings_above_floor']}")
    print(f"Outcome Message: {res['status_message']}")

if __name__ == "__main__":
    train_model()
