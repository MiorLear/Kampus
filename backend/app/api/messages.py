"""Messages API blueprint."""

from flask import Blueprint, jsonify, request

from app.services.messages_service import MessagesService

messages_bp = Blueprint("messages", __name__)


@messages_bp.get("/")
def list_messages():
    """Return all messages or filter by sender_id or receiver_id."""
    sender_id = request.args.get("sender_id")
    receiver_id = request.args.get("recipient_id") or request.args.get("receiver_id")
    service = MessagesService()

    try:
        messages = service.list_messages(sender_id=sender_id, receiver_id=receiver_id)
        return jsonify(messages), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching messages: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch messages"}), 500


@messages_bp.get("/<message_id>")
def get_message(message_id: str):
    """Get a message by ID."""
    service = MessagesService()

    try:
        message = service.get_message(message_id)
        if not message:
            return jsonify({"error": "Message not found"}), 404
        return jsonify(message), 200
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error fetching message: {exc}")
        return jsonify({"error": "Failed to fetch message"}), 500


@messages_bp.post("/")
def create_message():
    """Create a new message."""
    service = MessagesService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No message data provided"}), 400

    try:
        message_id = service.create_message(payload)
        return jsonify({"message": "Message created successfully", "id": message_id}), 201
    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error creating message: {exc}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to create message"}), 500


@messages_bp.put("/<message_id>")
def update_message(message_id: str):
    """Update a message."""
    service = MessagesService()
    payload = request.get_json(force=True)

    if not payload:
        return jsonify({"error": "No update data provided"}), 400

    try:
        service.update_message(message_id, payload)
        return jsonify({"message": "Message updated successfully", "id": message_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error updating message: {exc}")
        return jsonify({"error": "Failed to update message"}), 500


@messages_bp.delete("/<message_id>")
def delete_message(message_id: str):
    """Delete a message."""
    service = MessagesService()

    try:
        service.delete_message(message_id)
        return jsonify({"message": "Message deleted successfully", "id": message_id}), 200
    except ValueError as err:
        return jsonify({"error": str(err)}), 404
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error deleting message: {exc}")
        return jsonify({"error": "Failed to delete message"}), 500

