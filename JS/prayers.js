import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { auth, database } from './firebase-config.js';


let currentDate = new Date();

document.getElementById('prev-day').addEventListener('click', function() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateAndFetchPrayerTimes();
});

document.getElementById('next-day').addEventListener('click', function() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateAndFetchPrayerTimes();
});

function updateDateAndFetchPrayerTimes() {
    console.log("Updated Date:", currentDate); // Log the current date for debugging
    updateGregorianDate();
    fetchPrayerTimesFromAPI();
    fetchHijriDateFromAPI();
    updateTickStatesForDate();
}

function updatePrayerTimes() {
    // Retrieve the combined city and country value
    const location = document.getElementById('locationInput').value;
     // Get the message placeholder element
     const messageElement = document.getElementById('message');

     // Clear any existing message
     messageElement.textContent = '';
     
     // Check if the input is empty or doesn't contain a comma
     if (!location || !location.includes(',')) {
         messageElement.textContent = "Please enter the location in the format 'City, Country'.";
         return; // Exit the function to prevent further execution
     }
    // Attempt to split the location into city and country based on a comma
    const [city, country] = location.split(',').map(item => item.trim());
    
    // Check if both city and country are provided
    if (city && country) {
        // Save city and country to localStorage
        localStorage.setItem('savedCity', city);
        localStorage.setItem('savedCountry', country);
        
        // Assuming fetchPrayerTimes is a function you've defined to fetch and display prayer times
        fetchPrayerTimesFromAPI();
    } else {
        messageElement.textContent = "Please enter the location in the format 'City, Country'.";
    }
} 

function updateGregorianDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('gregorianDate').textContent = currentDate.toLocaleDateString('en-US', options);
}

function fetchPrayerTimesFromAPI() {
    const city = localStorage.getItem('savedCity');
    const country = localStorage.getItem('savedCountry');
    // Correctly format the date to DD-MM-YYYY
    const dateStr = ('0' + currentDate.getDate()).slice(-2) + '-' + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' + currentDate.getFullYear();

    if (city && country) {
        // Construct the API request URL with the corrected date format
        const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
        console.log("Fetching prayer times for URL:", url); // Debugging

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data); // Debugging: Log the data to see the structure

                if(data.code === 200) {
                    const times = data.data.timings;

                    document.getElementById('fajrTime').textContent = times.Fajr;
                    document.getElementById('sunriseTime').textContent = times.Sunrise;
                    document.getElementById('dhuhrTime').textContent = times.Dhuhr;
                    document.getElementById('asrTime').textContent = times.Asr;
                    document.getElementById('maghribTime').textContent = times.Maghrib;
                    document.getElementById('ishaTime').textContent = times.Isha;
                    
                    highlightCurrentPrayer();
                } else {
                    console.error('Failed to fetch prayer times:', data.status);
                }
            })
            .catch(error => console.error('Error fetching prayer times:', error));
    } else {
        console.log("City and country not set in localStorage.");
    }
}


function fetchHijriDateFromAPI() {
    const dateStr = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const url = `http://api.aladhan.com/v1/gToH?date=${dateStr}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.hijri) {
                const hijriDate = `${data.data.hijri.day} ${data.data.hijri.month.en} ${data.data.hijri.year}`;
                document.getElementById('hijriDate').textContent = hijriDate;
            } else {
                document.getElementById('hijriDate').textContent = 'Hijri date unavailable';
            }
        })
        .catch(error => {
            console.error('Error fetching Hijri date:', error);
        });
}

window.onload = function() {
    const savedCity = localStorage.getItem('savedCity');
    const savedCountry = localStorage.getItem('savedCountry');
    if (savedCity && savedCountry) {
        document.getElementById('locationInput').value = `${savedCity}, ${savedCountry}`;
    }
    updateDateAndFetchPrayerTimes();
    displayWeeklyTrend();
};

function highlightCurrentPrayer() {
    // Ensure we only highlight prayers for today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const currentDateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

    if (todayStr !== currentDateStr) {
        // If it's not today, ensure no prayer times are highlighted and exit the function
        document.querySelectorAll('.prayer-box').forEach(box => box.classList.remove('current-prayer'));
        return;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Adjust the logic to better handle the transition between Fajr and Sunrise
    const prayerTimes = [
        { id: 'fajrTime', time: document.getElementById('fajrTime').textContent },
        { id: 'sunriseTime', time: document.getElementById('sunriseTime').textContent },
        { id: 'dhuhrTime', time: document.getElementById('dhuhrTime').textContent },
        { id: 'asrTime', time: document.getElementById('asrTime').textContent },
        { id: 'maghribTime', time: document.getElementById('maghribTime').textContent },
        { id: 'ishaTime', time: document.getElementById('ishaTime').textContent }
    ].map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        return { ...prayer, minutes: hours * 60 + minutes };
    });

    prayerTimes.sort((a, b) => a.minutes - b.minutes);

    // Remove highlighting from all prayer boxes
    document.querySelectorAll('.prayer-box').forEach(box => box.classList.remove('current-prayer'));

    let currentPrayerIndex = prayerTimes.findIndex((prayer, index) => {
        if (index === prayerTimes.length - 1) return currentTime >= prayer.minutes;
        return currentTime >= prayer.minutes && currentTime < prayerTimes[index + 1].minutes;
    });

    // Special handling to ensure Sunrise is highlighted when it's the next prayer after Fajr
    const sunriseIndex = prayerTimes.findIndex(prayer => prayer.id === 'sunriseTime');
    if (currentTime >= prayerTimes[sunriseIndex - 1].minutes && currentTime < prayerTimes[sunriseIndex].minutes) {
        // If current time is between Fajr and Sunrise, highlight Sunrise instead
        currentPrayerIndex = sunriseIndex;
    }

    if (currentPrayerIndex !== -1) {
        const currentPrayerBox = document.getElementById(prayerTimes[currentPrayerIndex].id).closest('.prayer-box');
        if (currentPrayerBox) currentPrayerBox.classList.add('current-prayer');
    }
}


document.querySelectorAll('.circle-tick').forEach(item => {
    item.addEventListener('click', function() {
        const user = auth.currentUser; // Get the currently signed-in user
        if (!user) {
            console.error("User not signed in");
            return;
        }

        const now = new Date();
        const todayStr = buildDateKey(now);
        const currentDateStr = buildDateKey(currentDate);

        // Determine if the current date is in the future or if it's today and the prayer time has not occurred yet
        const isFutureDate = currentDate > now;
        let isFuturePrayer = false;

        // If it's today, further check if the prayer time is in the future
        if (todayStr === currentDateStr) {
            const prayerTimeStr = this.parentElement.querySelector('.prayer-time').textContent; // Format: HH:MM
            const prayerTimeParts = prayerTimeStr.split(':');
            const prayerDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(prayerTimeParts[0]), parseInt(prayerTimeParts[1]));

            // Determine if the prayer time is in the future
            isFuturePrayer = prayerDateTime > now;
        }

        // Prevent ticking for future prayers or days
        if (isFutureDate || isFuturePrayer) {
            console.log("Cannot tick future prayers or prayers on future dates.");
            return;
        }

        // Toggle tick state if not a future prayer
        const isChecked = this.getAttribute('data-checked') === 'true';
        const newState = !isChecked;
        this.setAttribute('data-checked', newState.toString());
        this.classList.toggle('checked', newState);

        // Save the new state to Firebase instead of localStorage
        const prayerName = this.closest('.prayer-box').querySelector('.prayer-name').textContent;
        const prayerKey = `${currentDateStr}_${prayerName}`;
        
        const tickStateRef = ref(database, `users/${user.uid}/tickStates/${prayerKey}`);
        set(tickStateRef, newState).then(() => {
            console.log("Tick state saved successfully.");
        }).catch((error) => {
            console.error("Failed to save tick state:", error);
        });

        // Optional: Trigger UI updates that depend on the tick state
        // Since these updates might rely on Firebase data now, consider fetching the latest state
        // or trigger these updates directly here if they don't depend on the tick state data
        // For example:
        updateTickStatesForDate();
        displayWeeklyTrend();
    });
});



function buildDateKey(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}
function updateTickStatesForDate() {
    const user = auth.currentUser; // Get the currently signed-in user
    if (!user) {
        console.error("User not signed in");
        return;
    }

    // Fetch all tick states for the current user
    const tickStatesRef = ref(database, `users/${user.uid}/tickStates`);
    get(tickStatesRef).then((snapshot) => {
        if (snapshot.exists()) {
            const allTickStates = snapshot.val(); // Object containing all tick states
            const dateKeyPrefix = buildDateKey(currentDate); // YYYY-MM-DD format for the current date

            // Filter tick states for the current date
            const todaysTickStates = Object.keys(allTickStates).reduce((acc, key) => {
                if (key.startsWith(dateKeyPrefix)) {
                    // Extract the prayer name from the key
                    const prayerName = key.split('_')[1];
                    acc[prayerName] = allTickStates[key];
                }
                return acc;
            }, {});

            // Update the UI with today's tick states
            document.querySelectorAll('.prayer-box').forEach(box => {
                const prayerName = box.getAttribute('data-prayer');

                // Skip updating ticks for Sunrise since it's not a prayer
                if (prayerName === "Sunrise") return;

                const isChecked = todaysTickStates.hasOwnProperty(prayerName) ? todaysTickStates[prayerName] : false;
                const tickElement = box.querySelector('.circle-tick');

                if (tickElement) {
                    tickElement.setAttribute('data-checked', isChecked.toString());
                    tickElement.classList.toggle('checked', isChecked);
                } else {
                    console.error('Tick element not found for prayer:', prayerName);
                }
            });
        } else {
            console.log("No tick states available.");
            // Reset UI as no tick states found
            document.querySelectorAll('.prayer-box .circle-tick').forEach(tickElement => {
                tickElement.setAttribute('data-checked', 'false');
                tickElement.classList.remove('checked');
            });
        }
    }).catch((error) => {
        console.error("Failed to fetch tick states:", error);
    });
}

function getStartOfWeek(date) {
    const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(date.setDate(diff));
} 



function calculateWeeklyCompletionRates() {
    const startOfWeek = getStartOfWeek(new Date());
    const dailyRates = {};

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateKey = buildDateKey(currentDate);

        let completedPrayers = 0;
        ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(prayer => {
            const prayerKey = `${dateKey}_${prayer}`;
            if (localStorage.getItem(prayerKey) === 'true') {
                completedPrayers++;
            }
        });

        // Assuming 5 prayers per day, calculate completion rate
        const completionRate = completedPrayers / 5;
        dailyRates[dateKey] = completionRate;
    }

    return dailyRates;
} 

displayWeeklyTrend();

function displayWeeklyTrend() {
    const weeklyRates = calculateWeeklyCompletionRates();
    const container = document.querySelector('#weekly-trend');
    container.innerHTML = ''; // Clear previous content

    // Array of weekdays, assuming Monday is the first day of the week
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Use the start of the week to align the rates with weekdays
    const startOfWeek = getStartOfWeek(new Date());
    
    weekdays.forEach((weekday, index) => {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + index);
        const dateKey = buildDateKey(currentDate);
        const completionRate = weeklyRates[dateKey] || 0;

        // Create a wrapper div for each day
        let dayWrapper = document.createElement("div");
        dayWrapper.className = "day-trend-wrapper";

        // Create and append the day label
        let dayLabel = document.createElement("div");
        dayLabel.className = "day-label";
        dayLabel.textContent = weekday.substring(0, 3); // Use the first three letters of the weekday
        dayWrapper.appendChild(dayLabel);

        const svgNS = "http://www.w3.org/2000/svg";
        let svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 36 36");
        svg.setAttribute("class", "circular-chart");
        svg.style.width = "60px"; // Set the SVG width
        svg.style.height = "60px"; // Set the SVG height

        // Background circle
        let circleBg = document.createElementNS(svgNS, "circle");
        circleBg.setAttribute("stroke", "#eee");
        circleBg.setAttribute("cx", "18");
        circleBg.setAttribute("cy", "18");
        circleBg.setAttribute("r", "15.91549430918954");
        circleBg.setAttribute("fill", "none");
        circleBg.setAttribute("stroke-width", "4");

        // Progress circle
        let circleProgress = document.createElementNS(svgNS, "circle");
        circleProgress.setAttribute("stroke", "green");
        circleProgress.setAttribute("cx", "18");
        circleProgress.setAttribute("cy", "18");
        circleProgress.setAttribute("r", "15.91549430918954");
        circleProgress.setAttribute("fill", "none");
        circleProgress.setAttribute("stroke-width", "4");
        circleProgress.setAttribute("stroke-dasharray", `${completionRate * 100} ${100 - (completionRate * 100)}`);
        circleProgress.setAttribute("transform", "rotate(-90 18 18)");

        svg.appendChild(circleBg);
        svg.appendChild(circleProgress);
        dayWrapper.appendChild(svg); // Append the SVG to the wrapper

        container.appendChild(dayWrapper); // Append the wrapper to the container
    });
}

function updateWeeklyTrend() {
    const weekStart = getStartOfWeek(new Date());
    
    const container = document.getElementById('weekly-trend');
    container.innerHTML = ''; // Clear existing content

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const dateKey = buildDateKey(currentDate);

        let completedPrayers = 0;
        ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(prayer => {
            const prayerKey = `${dateKey}_${prayer}`;
            if (localStorage.getItem(prayerKey) === 'true') {
                completedPrayers++;
            }
        });

        const completionRate = completedPrayers / 5; // Calculate the completion rate
        const dayElement = document.createElement('div');
        dayElement.className = 'day-trend';
        dayElement.style.setProperty('--completion', completionRate); // Set CSS variable for completion
        dayElement.title = `Completion rate: ${Math.round(completionRate * 100)}%`;
        container.appendChild(dayElement);
    }
}

// Call this function to update the weekly trend visualization
updateWeeklyTrend(); 

function initializeQadhaTracker() {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const container = document.querySelector('.qadha-prayers-container');
    container.innerHTML = ''; // Clear existing content

    prayers.forEach(prayer => {
        const prayerElement = document.createElement('div');
        prayerElement.className = 'qadha-prayer';
        prayerElement.setAttribute('data-prayer', prayer); // Unique identifier for each prayer

        const prayerNameElement = document.createElement('span');
        prayerNameElement.className = 'qadha-prayer-name';
        prayerNameElement.textContent = prayer;

        const decrementButton = document.createElement('button');
        decrementButton.textContent = '-';
        decrementButton.onclick = () => changeQadhaCount(prayer, -1);

        const countElement = document.createElement('span');
        countElement.className = 'qadha-count';
        countElement.textContent = getQadhaCount(prayer);

        const incrementButton = document.createElement('button');
        incrementButton.textContent = '+';
        incrementButton.onclick = () => changeQadhaCount(prayer, 1);

        // Assemble the prayer element
        prayerElement.appendChild(prayerNameElement);
        prayerElement.appendChild(decrementButton);
        prayerElement.appendChild(countElement);
        prayerElement.appendChild(incrementButton);

        // Add to container
        container.appendChild(prayerElement);
    });
}

function getQadhaCount(prayer) {
    // Retrieve the count from localStorage, defaulting to 0 if not found
    return parseInt(localStorage.getItem(`qadha-${prayer}`)) || 0;
}

function changeQadhaCount(prayer, change) {
    // Calculate the new count and ensure it doesn't drop below 0
    const currentCount = getQadhaCount(prayer);
    const newCount = Math.max(currentCount + change, 0);

    // Update localStorage with the new count
    localStorage.setItem(`qadha-${prayer}`, newCount.toString());

    // Directly update the UI with the new count for the specific prayer
    document.querySelector(`[data-prayer="${prayer}"] .qadha-count`).textContent = newCount;
}


// Initialize the Qadha tracker when the page loads or when appropriate
initializeQadhaTracker();

