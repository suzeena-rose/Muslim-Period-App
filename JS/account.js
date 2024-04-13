// Import necessary Firebase functions from the SDK
import { auth, database } from './firebase-config.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { updatePassword as firebaseUpdatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Function to fetch user profile from Firebase and update the UI
function fetchUserProfile() {
    const user = auth.currentUser;
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('nameInput').value = data.name || '';
                document.getElementById('emailInput').value = user.email;
            } else {
                console.log("No user data available");
            }
        }).catch((error) => {
            console.error("Error fetching user data:", error);
        });
    } else {
        console.log("No user is currently logged in.");
    }
}

// Function to save changes to the user's name
function saveChanges() {
    const user = auth.currentUser;
    if (user) {
        const userData = {
            name: document.getElementById('nameInput').value,
        };

        const userRef = ref(database, 'users/' + user.uid);
        update(userRef, userData).then(() => {
            console.log('Data updated successfully!');
        }).catch((error) => {
            console.error('Failed to update data', error);
        });
    } else {
        console.log("No user is currently logged in.");
    }
} 
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('passwordChangeForm');
    form.addEventListener('submit', changeUserPassword);

    fetchUserProfile(); // Assuming this function exists to load user data
});

function changeUserPassword(event) {
    event.preventDefault();

    // Clear previous messages
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.getElementById('formMessage').textContent = '';

    const user = auth.currentUser;
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    let valid = true;
    if (!currentPassword) {
        document.getElementById('currentPasswordError').textContent = 'Current password is required.';
        valid = false;
    }
    if (!newPassword) {
        document.getElementById('newPasswordError').textContent = 'New password is required.';
        valid = false;
    }
    if (newPassword !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match.';
        valid = false;
    }

    if (!valid) return; // Stop the function if validation fails

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    reauthenticateWithCredential(user, credential).then(() => {
        firebaseUpdatePassword(user, newPassword).then(() => {
            document.getElementById('formMessage').textContent = "Password updated successfully!";
            document.getElementById('formMessage').style.color = 'green';
        }).catch((error) => {
            document.getElementById('formMessage').textContent = "Error updating password: " + error.message;
            document.getElementById('formMessage').style.color = 'red';
        });
    }).catch((error) => {
        document.getElementById('currentPasswordError').textContent = "Current password is incorrect or there was an error: " + error.message;
        document.getElementById('formMessage').style.color = 'red';
    });
}





// Setting up event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize fetching user profile
    fetchUserProfile();

    // Setup listeners for form submissions or button clicks if necessary
    document.getElementById('saveChangesBtn').addEventListener('click', saveChanges);
    document.getElementById('changePasswordBtn').addEventListener('click', changeUserPassword);

    // Assuming you have buttons with IDs 'saveChangesBtn' and 'changePasswordBtn' in your HTML
});

// Monitor authentication state changes
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User is signed in");
        fetchUserProfile(); // Fetch user profile if signed in
    } else {
        console.log("User is signed out");
    }
});

function togglePasswordVisibility(passwordInputId, toggleIconId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleIcon = document.getElementById(toggleIconId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.textContent = "visibility";
    } else {
        passwordInput.type = "password";
        toggleIcon.textContent = "visibility_off";
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Fetch all elements with the 'view-password' class
    const viewPasswordToggles = document.querySelectorAll('.view-password');

    // Add click event listeners to each toggle
    viewPasswordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Extract IDs or use a method to determine which input this toggle is related to
            // Assuming the structure is consistent and input is right before the span
            const passwordInputId = toggle.previousElementSibling.id;
            const toggleIconId = toggle.id;

            togglePasswordVisibility(passwordInputId, toggleIconId);
        });
    });
});
