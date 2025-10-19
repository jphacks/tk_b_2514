import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// Firebase設定（環境変数ベース）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase初期化
type FirebaseAppType = ReturnType<typeof initializeApp>;
type FirebaseAuthType = ReturnType<typeof getAuth>;

const app: FirebaseAppType = initializeApp(firebaseConfig);
const auth: FirebaseAuthType = getAuth(app);

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence)
    .then((): void => {
      console.log("Firebase Auth persistence set to localStorage");
    })
    .catch((error) => {
      console.error("Persistence設定エラー:", error);
    });
}

export { auth };
