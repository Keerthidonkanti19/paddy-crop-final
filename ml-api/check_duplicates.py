
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