# import os
# import hashlib

# train_path = r"D:\rice leaf disease detection\Train-20260428T163352Z-3-001\Train"
# test_path = r"D:\rice leaf disease detection\Test-20260428T163352Z-3-001\Test"

# def get_hash(file_path):
#     hash_md5 = hashlib.md5()
#     with open(file_path, "rb") as f:
#         for chunk in iter(lambda: f.read(4096), b""):
#             hash_md5.update(chunk)
#     return hash_md5.hexdigest()

# train_hashes = set()

# # Collect hashes from train folder
# for root, dirs, files in os.walk(train_path):
#     for file in files:
#         if file.lower().endswith((".jpg", ".jpeg", ".png")):
#             path = os.path.join(root, file)
#             train_hashes.add(get_hash(path))

# duplicates = []

# # Compare with test folder
# for root, dirs, files in os.walk(test_path):
#     for file in files:
#         if file.lower().endswith((".jpg", ".jpeg", ".png")):
#             path = os.path.join(root, file)
#             if get_hash(path) in train_hashes:
#                 print("Removing duplicate:", path)
#                 os.remove(path)

# if duplicates:
#     print("Duplicate images found:")
#     for d in duplicates:
#         print(d)
# else:
#     print("No duplicate images between train and test folders.")


from pathlib import Path
import hashlib

dataset_path = Path("data")

hash_map = {}
duplicates = []


def get_hash(file_path):
    hasher = hashlib.md5()

    with open(file_path, "rb") as f:
        hasher.update(f.read())

    return hasher.hexdigest()


# Scan all splits
for split in ["train", "val", "test"]:

    split_path = dataset_path / split

    for image_file in split_path.rglob("*"):

        if image_file.is_file():

            if image_file.suffix.lower() not in [
                ".jpg",
                ".jpeg",
                ".png",
            ]:
                continue

            try:

                file_hash = get_hash(image_file)

                if file_hash in hash_map:

                    duplicates.append(
                        (hash_map[file_hash], image_file)
                    )

                else:
                    hash_map[file_hash] = image_file

            except Exception as e:
                print(f"Error processing {image_file}: {e}")


print("\n===== DUPLICATES FOUND =====\n")

if len(duplicates) == 0:

    print("No duplicates found.")

else:

    for original, duplicate in duplicates:

        print(f"\nORIGINAL : {original}")
        print(f"DUPLICATE: {duplicate}")

print(f"\nTotal duplicates: {len(duplicates)}")