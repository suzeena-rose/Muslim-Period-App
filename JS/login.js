import { auth, database} from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { sendPasswordResetEmail } from './firebase-config.js';
  
  document.querySelector(".input-submit").addEventListener('click', (e) => {
        e.preventDefault();

        const email = document.getElementById('user').value;
        const password = document.getElementById('pass').value;

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login successful, fetch user data from the Realtime Database
            const uid = userCredential.user.uid;
            return get(ref(database, `users/${uid}`)); // Fetch the user's data
        })
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                // Assuming you want to redirect and then display the user's name somewhere
                // You might want to save the user's name in sessionStorage/localStorage for later use
                sessionStorage.setItem('userName', userData.name);
                document.getElementById('message').innerHTML = '<p class="success">Login successful! Redirecting...</p>';

                setTimeout(() => {
                    window.location.href = './dashboard.html'; // Adjust URL as needed
                }, 2000); // Adjust timing as needed
            } else {
                console.log("No user data available");
            }
            })
            .catch((error) => {
                // Login failed
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


document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent the link from navigating.
    const email = prompt('Please enter your email address:');
    if (email) { // Check if email is not null or empty
        sendPasswordResetEmail(auth, email)
            .then(() => {
                document.getElementById('message').innerHTML = '<p class="success">Password reset email sent! Check your inbox.</p>';
            })
            .catch((error) => {
                console.error('Error sending password reset email:', error);
                document.getElementById('message').innerHTML = `<p class="error">Failed to send password reset email: ${error.message}</p>`;
            });
    } else {
        document.getElementById('message').innerHTML = '<p class="error">You must enter an email address to reset your password.</p>';
    }
});

