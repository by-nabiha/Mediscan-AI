from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image

# Load the pretrained model and its image processor
model_name = "nickmuchi/vit-finetuned-chest-xray-pneumonia"
processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(model_name)

print("Model loaded successfully")
print("Labels:", model.config.id2label)

# Test on an actual X-ray image
image = Image.open("test_xray.jpg").convert("RGB")
inputs = processor(images=image, return_tensors="pt")
outputs = model(**inputs)

import torch
probabilities = torch.softmax(outputs.logits, dim=1)
print("Probabilities:", probabilities)

predicted_class = outputs.logits.argmax(-1).item()
print("Prediction:", model.config.id2label[predicted_class])