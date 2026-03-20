import os
import hashlib

train_path = r"D:\paddy crop disease dataset - Copy\Ultimate Crop Disease Dataet\train"
test_path = r"D:\paddy crop disease dataset - Copy\Ultimate Crop Disease Dataet\test"

def get_hash(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

train_hashes = set()

# Collect hashes from train folder
for root, dirs, files in os.walk(train_path):
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            path = os.path.join(root, file)
            train_hashes.add(get_hash(path))

duplicates = []

# Compare with test folder
for root, dirs, files in os.walk(test_path):
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            path = os.path.join(root, file)
            if get_hash(path) in train_hashes:
                print("Removing duplicate:", path)
                os.remove(path)

if duplicates:
    print("Duplicate images found:")
    for d in duplicates:
        print(d)
else:
    print("No duplicate images between train and test folders.")