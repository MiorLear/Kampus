"""Firebase Admin SDK helpers."""

import os
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore


@lru_cache()
def init_firebase():
    """Initialise Firebase Admin SDK (idempotent)."""
    if firebase_admin._apps:  # type: ignore[attr-defined]
        return firebase_admin.get_app()

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-service-account.json")
    cred = credentials.Certificate(cred_path)
    return firebase_admin.initialize_app(cred)


def get_db() -> firestore.Client:
    """Return a Firestore client."""
    init_firebase()
    return firestore.client()
