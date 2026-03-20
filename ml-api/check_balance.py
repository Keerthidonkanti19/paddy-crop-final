import os

train_path = r"D:\paddy crop disease dataset - Copy\Ultimate Crop Disease Dataet\train"

for cls in os.listdir(train_path):
    cls_path = os.path.join(train_path, cls)
    if os.path.isdir(cls_path):
        print(cls, "→", len(os.listdir(cls_path)), "images")