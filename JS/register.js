import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, set, ref} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDcni6HoeE9FDW7WEzSs8kHLqzdiC8Oik8",
  authDomain: "muslimah-tracker.firebaseapp.com",
  databaseURL: "https://muslimah-tracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "muslimah-tracker",
  storageBucket: "muslimah-tracker.appspot.com",
  messagingSenderId: "460548782897",
  appId: "1:460548782897:web:745748391533947bb80e10"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

document.getElementById('register').addEventListener('click', (e) => {
console.log('Register button clicked');
e.preventDefault();

    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            set(ref(database, 'users/' + user.uid),{
                name: name,
                email: email, 
            }).then(() => {
                // After successful save, redirect to dashboard or show success message
                document.getElementById('message').innerHTML = '<p class="success">Registration successful! Redirecting...</p>';
                setTimeout(() => {
                    window.location.href = './dashboard.html'; // Adjust URL as needed
                }, 2000); // Adjust timing as needed
            }).catch((error) => {
                // Handle errors for saving to database here
                document.getElementById('message').innerHTML = `<p class="error">Error: ${error.message}</p>`;
            });
        }).catch((error) => {
            // User registration failed
            document.getElementById('message').innerHTML = `<p class="error">Error: ${error.message}</p>`;
        });
});

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('pass');
    const toggleIcon = document.querySelector('.view-password');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.textContent = "visibility";
    } else {
        passwordInput.type = "password";
        toggleIcon.textContent = "visibility_off";
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.view-password').addEventListener('click', togglePasswordVisibility);
});

