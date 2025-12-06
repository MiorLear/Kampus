"""Script to create test messages in Firestore."""

import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.firebase import get_db


def create_test_messages():
    """Create test messages between users."""
    db = get_db()
    messages_collection = db.collection("messages")
    
    # First, get some users to create messages between
    users_collection = db.collection("users")
    users = list(users_collection.limit(10).stream())
    
    if len(users) < 2:
        print("❌ Need at least 2 users to create test messages")
        print("   Please create some users first")
        return
    
    print(f"✅ Found {len(users)} users")
    
    # Sample messages
    test_messages = [
        {
            "sender_id": users[0].id,
            "receiver_id": users[1].id,
            "content": "Hello! I have a question about the course material. Can you help me?",
            "sent_at": (datetime.utcnow() - timedelta(days=5)).isoformat() + "Z",
            "read": False,
        },
        {
            "sender_id": users[1].id,
            "receiver_id": users[0].id,
            "content": "Of course! What would you like to know?",
            "sent_at": (datetime.utcnow() - timedelta(days=4, hours=12)).isoformat() + "Z",
            "read": True,
        },
        {
            "sender_id": users[0].id,
            "receiver_id": users[1].id,
            "content": "I'm having trouble understanding the assignment requirements. Could you clarify?",
            "sent_at": (datetime.utcnow() - timedelta(days=3)).isoformat() + "Z",
            "read": True,
        },
        {
            "sender_id": users[1].id,
            "receiver_id": users[0].id,
            "content": "Sure! The assignment requires you to create a responsive website using HTML, CSS, and JavaScript. Make sure to include at least 3 pages.",
            "sent_at": (datetime.utcnow() - timedelta(days=2, hours=8)).isoformat() + "Z",
            "read": False,
        },
    ]
    
    # Add more messages if we have more users
    if len(users) >= 3:
        test_messages.extend([
            {
                "sender_id": users[2].id,
                "receiver_id": users[0].id,
                "content": "Hi! I saw your question in the forum. I had the same issue last week.",
                "sent_at": (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z",
                "read": False,
            },
            {
                "sender_id": users[0].id,
                "receiver_id": users[2].id,
                "content": "Thanks for reaching out! How did you solve it?",
                "sent_at": (datetime.utcnow() - timedelta(hours=12)).isoformat() + "Z",
                "read": True,
            },
        ])
    
    if len(users) >= 4:
        test_messages.extend([
            {
                "sender_id": users[3].id,
                "receiver_id": users[1].id,
                "content": "When is the next assignment due? I want to make sure I submit it on time.",
                "sent_at": (datetime.utcnow() - timedelta(hours=6)).isoformat() + "Z",
                "read": False,
            },
            {
                "sender_id": users[1].id,
                "receiver_id": users[3].id,
                "content": "The next assignment is due on November 25th. Good luck!",
                "sent_at": (datetime.utcnow() - timedelta(hours=3)).isoformat() + "Z",
                "read": True,
            },
        ])
    
    # Create messages
    created_count = 0
    for message_data in test_messages:
        try:
            messages_collection.add(message_data)
            created_count += 1
            sender_name = next((u.to_dict().get("name", "Unknown") for u in users if u.id == message_data["sender_id"]), "Unknown")
            receiver_name = next((u.to_dict().get("name", "Unknown") for u in users if u.id == message_data["receiver_id"]), "Unknown")
            print(f"✅ Created message: {sender_name} → {receiver_name}")
        except Exception as e:
            print(f"❌ Error creating message: {e}")
    
    print(f"\n✅ Successfully created {created_count} test messages!")


if __name__ == "__main__":
    print("Creating test messages...")
    create_test_messages()

