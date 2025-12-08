// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAa-6frUUM19bAmyoOJquEbb6OFGbhktso",
  authDomain: "my-universal-notes-tandi.firebaseapp.com",
  projectId: "my-universal-notes-tandi",
  storageBucket: "my-universal-notes-tandi.firebasestorage.app",
  messagingSenderId: "294166208022",
  appId: "1:294166208022:web:3def2ec0ea8f602fd2df37",
  measurementId: "G-3BMJ85HFMN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);