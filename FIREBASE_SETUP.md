# Firebase Setup Instructions

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "Xmas Warmup")
4. Click **Continue** through the steps (you can disable Google Analytics if not needed)
5. Click **Create project**

## 🌐 Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Xmas Warmup Web")
3. **Don't** check "Also set up Firebase Hosting" (unless you want to use it)
4. Click **Register app**
5. Copy the `firebaseConfig` object shown on screen

## 📝 Step 3: Update Configuration File

1. Open `src/firebase.config.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // Your actual values here
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 🗄️ Step 4: Enable Realtime Database

1. In Firebase Console, go to **Build** > **Realtime Database**
2. Click **Create Database**
3. Choose a location close to your users (e.g., `us-central1`)
4. Select **Start in test mode** (we'll secure it next)
5. Click **Enable**

## 🔒 Step 5: Set Security Rules

1. In **Realtime Database**, go to the **Rules** tab
2. Replace the rules with:

```json
{
  "rules": {
    "party-items": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click **Publish**

**Note:** These rules allow anyone to read/write. For a private event with friends, this is fine. The passcode in your app provides basic access control.

## ✅ Step 6: Test Your App

1. Run `npm install` (if you haven't already)
2. Run `npm run dev`
3. Open the app in your browser
4. Enter the passcode: `party2024`
5. Try claiming an item
6. Open the app in another browser/tab to verify real-time updates work!

## 🚀 Step 7: Deploy Your App

### Option A: Vercel (Recommended - Easiest)
```bash
npm install -g vercel
npm run build
vercel
```

### Option B: Netlify
```bash
npm run build
# Then drag & drop the 'dist' folder to netlify.com/drop
```

### Option C: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🎉 Done!

Your app is now live and users can see each other's selections in real-time!

## 🔧 Troubleshooting

**"Firebase not defined" error:**
- Make sure you ran `npm install`
- Check that `firebase.config.js` has your actual config values

**"Permission denied" error:**
- Verify security rules are published in Firebase Console
- Make sure databaseURL is correct in your config

**Items not syncing:**
- Check browser console for errors
- Verify you're using the same Firebase project in both browser tabs
- Check Firebase Console > Realtime Database > Data to see if data is being saved

