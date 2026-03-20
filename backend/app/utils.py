def save_file(file, path: str):
    with open(path, "wb") as f:
        f.write(file.file.read())
    return path
