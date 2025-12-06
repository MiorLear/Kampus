"""Messages service for handling message operations."""

from datetime import datetime
from typing import List, Optional

from app.firebase import get_db


class MessagesService:
    """Service for managing messages."""

    def __init__(self):
        self.db = get_db()
        self.collection = self.db.collection("messages")

    def list_messages(
        self, sender_id: Optional[str] = None, receiver_id: Optional[str] = None
    ) -> List[dict]:
        """List all messages, optionally filtered by sender or receiver."""
        try:
            query = self.collection

            if sender_id:
                query = query.where("sender_id", "==", sender_id)
            elif receiver_id:
                query = query.where("receiver_id", "==", receiver_id)

            docs = query.stream()
            messages = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                messages.append(data)

            # Sort by sent_at descending (most recent first)
            messages.sort(
                key=lambda x: x.get("sent_at", ""), reverse=True
            )
            return messages
        except Exception as exc:
            print(f"Error listing messages: {exc}")
            import traceback
            traceback.print_exc()
            return []

    def get_message(self, message_id: str) -> Optional[dict]:
        """Get a message by ID."""
        try:
            doc = self.collection.document(message_id).get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        except Exception as exc:
            print(f"Error getting message: {exc}")
            return None

    def create_message(self, message_data: dict) -> str:
        """Create a new message."""
        try:
            # Ensure required fields
            if "sender_id" not in message_data or "receiver_id" not in message_data or "content" not in message_data:
                raise ValueError("Missing required fields: sender_id, receiver_id, content")

            # Set defaults
            message_data["sent_at"] = datetime.utcnow().isoformat() + "Z"
            message_data["read"] = message_data.get("read", False)

            _, doc_ref = self.collection.add(message_data)
            return doc_ref.id
        except Exception as exc:
            print(f"Error creating message: {exc}")
            import traceback
            traceback.print_exc()
            raise

    def update_message(self, message_id: str, update_data: dict) -> None:
        """Update a message."""
        try:
            doc_ref = self.collection.document(message_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                raise ValueError(f"Message {message_id} not found")

            doc_ref.update(update_data)
        except Exception as exc:
            print(f"Error updating message: {exc}")
            import traceback
            traceback.print_exc()
            raise

    def delete_message(self, message_id: str) -> None:
        """Delete a message."""
        try:
            doc_ref = self.collection.document(message_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                raise ValueError(f"Message {message_id} not found")

            doc_ref.delete()
        except Exception as exc:
            print(f"Error deleting message: {exc}")
            import traceback
            traceback.print_exc()
            raise

