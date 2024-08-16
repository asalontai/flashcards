// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirebase, getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuRV1x3Ik0jj1KIPlbUqal4mVNKNT5G9Q",
  authDomain: "flashcard-saas-4131d.firebaseapp.com",
  projectId: "flashcard-saas-4131d",
  storageBucket: "flashcard-saas-4131d.appspot.com",
  messagingSenderId: "774238415452",
  appId: "1:774238415452:web:302b489db403a208635499",
  measurementId: "G-DTRCKLHL44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export { db }