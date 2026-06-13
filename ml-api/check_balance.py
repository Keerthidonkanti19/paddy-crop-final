import os

for split in ["train", "val", "test"]:

    print(f"\n===== {split.upper()} =====")

    split_path = os.path.join("data", split)

    total = 0

    for cls in os.listdir(split_path):

        cls_path = os.path.join(split_path, cls)

        if os.path.isdir(cls_path):

            count = len(os.listdir(cls_path))

            total += count

            print(f"{cls} → {count} images")

    print(f"TOTAL → {total}")