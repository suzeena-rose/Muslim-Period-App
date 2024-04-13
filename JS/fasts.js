// Imports for Firebase functionalities
import { ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { auth, database } from './firebase-config.js'; // Ensure this path matches your Firebase config file

// Logging to check if the database ref is accessible
console.log("Testing database ref:", ref);

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("User is signed in:", user);
            fetchGregorianDatesForRamadan(1445);
        } else {
            console.log("No user is signed in.");
            // Optionally handle redirect to login page or display a login modal
        }
    });
}
// A variable to keep track of the currently selected day cell
let currentlySelectedDayCell = null;

// Function to format dates from the API into a standard format
function formatGregorianDate(dateString) {
    const formattedDateString = dateString.replace(/-/g, '/');
    const [year, month, day] = formattedDateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Format as YYYY-MM-DD with padded months and days
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchGregorianDatesForRamadan(1445); // Example Hijri year
});

// Async function to fetch Gregorian dates based on Hijri year
async function fetchGregorianDatesForRamadan(hijriYear) {
    const month = 9; // Ramadan is the 9th month of the Hijri calendar
    const adjustment = 0; // Adjust based on moon sighting method used
    const url = `http://api.aladhan.com/v1/hToGCalendar/${month}/${hijriYear}?adjustment=${adjustment}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK" && data.data) {
            displayDates(data.data);
        } else {
            console.error('Error fetching data:', data);
            document.getElementById('apiResponse').innerText = 'Error fetching data. See console for details.';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('apiResponse').innerText = 'Error fetching data. See console for details.';
    }
}
function displayDates(dates) {
    const container = document.getElementById('apiResponse');
    container.innerHTML = '';  // Clear previous content
    const today = new Date().toISOString().split('T')[0];

    dates.forEach(date => {
        const dayCell = document.createElement('div');
        dayCell.classList.add('dayCell');
        const gregorianDate = formatGregorianDate(date.gregorian.date);
        dayCell.dataset.date = gregorianDate;
        dayCell.innerHTML = `<span class="gregorianDate">${gregorianDate}</span><br/><span class="hijriDate">Ramadan ${date.hijri.day}</span><span class="status-icon"></span>`;

        container.appendChild(dayCell);
        dayCell.addEventListener('click', () => toggleFastStatus(dayCell, gregorianDate));

        loadDayState(gregorianDate).then(state => {
            if (state) {
                updateUIForDate(gregorianDate, state);
            }
        }).catch(error => {
            console.error("Error loading state for date:", gregorianDate, error);
        });
    });
}

function toggleFastStatus(dayCell, date) {
    let state = dayCell.classList.contains('completed') ? { completed: false } : { completed: true };
    saveDayState(date, state);
    updateUIForDate(date, state);
}

function updateUIForDate(date, state) {
    const dayCell = document.querySelector(`[data-date='${date}']`);
    if (!dayCell) return;
    
    const statusIcon = dayCell.querySelector('.status-icon');
    if (state.completed) {
        dayCell.classList.add('completed');
        statusIcon.innerHTML = '<i class="fas fa-check"></i>'; // Display a tick
    } else {
        dayCell.classList.remove('completed');
        statusIcon.innerHTML = ''; // Remove the tick
    }
}
function saveDayState(date, state) {
    if (!auth.currentUser) {
        console.error('User not authenticated.');
        return;
    }
    const userId = auth.currentUser.uid;
    const stateRef = ref(database, `users/${userId}/fastStates/${date}`);
    set(stateRef, state)
    .then(() => {
        console.log("State saved successfully for", date);
    })
    .catch((error) => {
        console.error("Error saving state:", error);
    });
}

function loadDayState(date) {
    if (!auth.currentUser) {
        console.error('User not authenticated.');
        return Promise.reject('User not authenticated.');
    }
    const userId = auth.currentUser.uid;
    const stateRef = ref(database, `users/${userId}/fastStates/${date}`);
    return get(stateRef)
    .then(snapshot => snapshot.exists() ? snapshot.val() : null)
    .catch(error => {
        console.error("Error loading state:", error);
        return Promise.reject(error);
    });
}

