import {getFirestore} from 'firebase/firestore'
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "clautechzs.firebaseapp.com",
  projectId: "clautechzs",
  storageBucket: "clautechzs.appspot.com",
  messagingSenderId: "695557093414",
  appId: "1:695557093414:web:15ecf56a3cc8cedce04ee7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const storage = getStorage(app)

export {storage, db}
