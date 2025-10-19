import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export const checkAuth = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
