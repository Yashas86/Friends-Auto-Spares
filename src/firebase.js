import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1r7etKTnUZIYHPwFw8IckqiXVacDl2s8",
  authDomain: "website-884e3.firebaseapp.com",
  projectId: "website-884e3",
  storageBucket: "website-884e3.firebasestorage.app",
  messagingSenderId: "452092071994",
  appId: "1:452092071994:web:cc8e2e034816e476536503",
  measurementId: "G-HTCPGL16WF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();