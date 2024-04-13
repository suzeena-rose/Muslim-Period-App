// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence, signOut, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDcni6HoeE9FDW7WEzSs8kHLqzdiC8Oik8",
    authDomain: "muslimah-tracker.firebaseapp.com",
    databaseURL: "https://muslimah-tracker-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "muslimah-tracker",
    storageBucket: "muslimah-tracker.appspot.com",
    messagingSenderId: "460548782897",
    appId: "1:460548782897:web:745748391533947bb80e10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Setting the persistence to SESSION
setPersistence(auth, browserSessionPersistence)
    .then(() => {
        // Persistence is set to SESSION. Handle authentication state change.
        auth.onAuthStateChanged(user => {
            const loginPagePath = '/login.html'; // Adjust as needed
            const currentPath = window.location.pathname;
            
            if (!user && currentPath !== loginPagePath) {
                console.log('No user is signed in, redirecting to login page.');
                window.location.href = loginPagePath;
            } else if (user) {
                console.log('User is signed in:', user);
                // User is signed in. You can perform additional checks or setups here.
            }
        });
    })
    .catch((error) => {
        console.error("Failed to set session persistence:", error);
    });

// Export Firebase auth and database objects for use in other parts of the app
export { auth, database, signOut,sendPasswordResetEmail };
