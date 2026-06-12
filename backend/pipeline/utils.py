import os
import pickle
import json

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")


def save_pickle(obj, filename):
    path = os.path.join(ARTIFACTS_DIR, filename)
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    return path


def load_pickle(filename):
    path = os.path.join(ARTIFACTS_DIR, filename)
    with open(path, "rb") as f:
        return pickle.load(f)


def save_json(obj, filename):
    path = os.path.join(ARTIFACTS_DIR, filename)
    with open(path, "w") as f:
        json.dump(obj, f, indent=2)
    return path


def load_json(filename):
    path = os.path.join(ARTIFACTS_DIR, filename)
    with open(path, "r") as f:
        return json.load(f)


def artifact_exists(filename):
    return os.path.exists(os.path.join(ARTIFACTS_DIR, filename))
