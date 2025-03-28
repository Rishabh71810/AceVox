// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeqL8FTjd1SF0wkIq93e6NRfKkGH3mU2g",
  authDomain: "acevox-250eb.firebaseapp.com",
  projectId: "acevox-250eb",
  storageBucket: "acevox-250eb.firebasestorage.app",
  messagingSenderId: "666479532621",
  appId: "1:666479532621:web:15d58c08201deb1169da04",
  measurementId: "G-EWZ7XJ0NS7"
};

// Initialize Firebase
const app =!getApps.length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app);
export const db = getFirestore(app);