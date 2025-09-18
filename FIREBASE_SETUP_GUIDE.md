# Firebase Setup Guide - Fix Registration Issues

## 🔥 Quick Setup to Fix Registration

The registration functionality requires proper Firebase configuration. Follow these steps:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** or select existing project
3. Follow the setup wizard

### Step 2: Enable Authentication
1. In your Firebase project, go to **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** provider
5. Enable **"Google"** provider (optional)

### Step 3: Create Firestore Database
1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for now)
4. Select a location close to your users

### Step 4: Get Your Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → **"Web"** (</> icon)
4. Register your app (name it "Kampus LMS")
5. Copy the config object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### Step 5: Update Your .env File
1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

### Step 6: Test Registration
1. Start the dev server: `npm run dev`
2. Go to the registration page
3. You should see a **Firebase Configuration** checker showing all green checkmarks
4. Use the **Test Registration** component (only visible in development) to test
5. Try registering a new user

## 🐛 Troubleshooting

### "Firebase is not properly configured"
- Check that all values in `.env` are real Firebase values (not placeholders)
- Restart your dev server after updating `.env`

### "auth/configuration-not-found"
- Make sure you've created a web app in Firebase Console
- Double-check your API key and other config values

### "auth/project-not-found"
- Verify your project ID is correct
- Make sure the Firebase project exists and is active

### "Missing or insufficient permissions"
- Make sure Firestore is created and set to test mode
- Check that Authentication is enabled

### "auth/email-already-in-use"
- This is normal! It means Firebase is working
- Try with a different email address

## 🎯 Next Steps After Setup

Once registration works:
1. Set up proper Firestore security rules
2. Configure email verification settings
3. Customize authentication UI
4. Add user profile management

## 📞 Still Having Issues?

If you're still having problems:
1. Check the browser console for detailed error messages
2. Look at the Firebase Configuration checker on the login page
3. Try the Test Registration component first
4. Make sure your Firebase project has billing enabled (if using production mode)