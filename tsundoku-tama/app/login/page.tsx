"use client";

import {
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
} from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    console.log("リダイレクトログイン開始");
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  useEffect(() => {
    // ログイン後に戻ってきたときの結果取得
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log(
            "ログイン成功:",
            result.user.displayName,
            result.user.email
          );
          router.push("/home");
        }
      })
      .catch((error) => {
        console.error("リダイレクトログイン失敗:", error);
      });
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">ログインページ</h1>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Googleでログイン
        </button>
      </div>
    </main>
  );
}
