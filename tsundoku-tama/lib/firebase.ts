// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "dummy",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: process.env.FIREBASE_PROJECT_ID || "dummy",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: process.env.FIREBASE_APP_ID || "dummy",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "dummy",
};

// Initialize Firebase only if environment variables are set
let app: any;
let db: any;
if (process.env.FIREBASE_PROJECT_ID) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} else {
  console.warn(
    "Firebase環境変数が設定されていません。ローカルストレージのみ使用します。"
  );
  db = null;
}

export { db };
