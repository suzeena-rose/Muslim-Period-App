// function fetchPrayerTimes(city, country) {
//     fetch(`http://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`)
//         .then(response => response.json())
//         .then(data => {
//             const times = data.data.timings;
//             document.getElementById('fajrTime').textContent = times.Fajr;
//             document.getElementById('sunriseTime').textContent = times.Sunrise;
//             document.getElementById('dhuhrTime').textContent = times.Dhuhr;
//             document.getElementById('asrTime').textContent = times.Asr;
//             document.getElementById('maghribTime').textContent = times.Maghrib;
//             document.getElementById('ishaTime').textContent = times.Isha;
//             // Load checkbox states in case the user changes location
//             loadCheckboxStates();
//         })
//         .catch(error => console.error('Error fetching prayer times:', error));
// } 

// function updatePrayerTimes() {
//     // Retrieve the combined city and country value
//     const location = document.getElementById('locationInput').value;
    
//     // Attempt to split the location into city and country based on a comma
//     const [city, country] = location.split(',').map(item => item.trim());
    
//     // Check if both city and country are provided
//     if (city && country) {
//         // Save city and country to localStorage
//         localStorage.setItem('savedCity', city);
//         localStorage.setItem('savedCountry', country);
        
//         // Assuming fetchPrayerTimes is a function you've defined to fetch and display prayer times
//         fetchPrayerTimes(city, country);
//     } else {
//         alert("Please enter the location in the format 'City, Country'.");
//     }
// }

// function fetchHijriDate() {
//     // Get today's date in the format DD-MM-YYYY
//     const today = new Date();
//     const day = String(today.getDate()).padStart(2, '0');
//     const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
//     const year = today.getFullYear();
//     const formattedDate = `${day}-${month}-${year}`;

//     // Call the API with the formatted date
//     fetch(`http://api.aladhan.com/v1/gToH/${formattedDate}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.data && data.data.hijri) {
//                 const hijriDate = `${data.data.hijri.day} ${data.data.hijri.month.en} ${data.data.hijri.year}`;
//                 document.getElementById('hijriDate').textContent = hijriDate;
//             } else {
//                 document.getElementById('hijriDate').textContent = 'Hijri date unavailable';
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching Hijri date:', error);
//             document.getElementById('hijriDate').textContent = 'Error fetching date';
//         });
// }

// // Ensure fetchHijriDate is called when the page loads
// window.onload = function() {
//     fetchHijriDate();
// };




// function calculateCycle() {
//     const start1 = new Date(document.getElementById('start1').value);
//     const end1 = new Date(document.getElementById('end1').value);
//     const start2 = new Date(document.getElementById('start2').value);
//     const end2 = new Date(document.getElementById('end2').value);

//     const cycle1Duration = Math.round((end1 - start1) / (1000 * 3600 * 24));
//     const cycle2Duration = Math.round((end2 - start2) / (1000 * 3600 * 24));

//     // Last valid haidh duration based on the first cycle (older)
//     let haidhDuration = cycle1Duration;

//     // Calculate gap between cycles
//     const gapBetweenCycles = Math.round((start2 - end1) / (1000 * 3600 * 24));

//     // Initialize variables for istihadha period tracking
//     let istihadhaStartDates = [];
//     let istihadhaEndDates = [];

//     // Handle istihadha for cycles longer than 10 days
//     if (cycle2Duration > 10) {
//         const istihadhaStart = new Date(start2);
//         istihadhaStart.setDate(start2.getDate() + haidhDuration);
//         const istihadhaEnd = new Date(end2);
        
//         // Add the start and end dates of the istihadha period to the arrays
//         istihadhaStartDates.push(istihadhaStart.toDateString());
//         istihadhaEndDates.push(istihadhaEnd.toDateString());
//     }

//     // Handle istihadha for gap less than 15 days
//     if (gapBetweenCycles < 15 && gapBetweenCycles > 0) {
//         const istihadhaGapStart = new Date(end1);
//         istihadhaGapStart.setDate(end1.getDate() + 1); // The day after the last cycle ends
//         const istihadhaGapEnd = new Date(start2);
//         istihadhaGapEnd.setDate(start2.getDate() - 1); // The day before the new cycle starts

//         // Add the start and end dates of the istihadha period due to short gap to the arrays
//         istihadhaStartDates.push(istihadhaGapStart.toDateString());
//         istihadhaEndDates.push(istihadhaGapEnd.toDateString());
//     }

//     // Prepare the result text including istihadha periods
//     let resultText = `<strong>Calculated Istihadha Periods:</strong><br>`;
    
//     for (let i = 0; i < istihadhaStartDates.length; i++) {
//         resultText += `Istihadha Start Date: ${istihadhaStartDates[i]}, End Date: ${istihadhaEndDates[i]}<br>`;
//     }

//     if (istihadhaStartDates.length === 0) {
//         resultText += "No istihadha periods identified based on the input.";
//     }

//     // Output the result
//     document.getElementById('result').innerHTML = resultText;
// }
let periodsLogged = []; // Array to store logged periods with datetime

function logInitialPeriods() {
    const start1 = document.getElementById('start1').value;
    const end1 = document.getElementById('end1').value;
    const start2 = document.getElementById('start2').value;
    const end2 = document.getElementById('end2').value;

    // Basic validation
    if (new Date(start1) >= new Date(end1) || new Date(start2) >= new Date(end2)) {
        alert("Please ensure start dates are before end dates for both periods.");
        return;
    }

    periodsLogged.push({ start: new Date(start1), end: new Date(end1) });
    periodsLogged.push({ start: new Date(start2), end: new Date(end2) });

    calculateHabits();
    document.getElementById('initialPeriodLogForm').style.display = 'none'; // Hide initial log form
}

function calculateHabits() {
    // Ensure periods are sorted
    periodsLogged.sort((a, b) => a.start - b.start);

    // Assuming the last two periods are used to establish the initial habits
    const lastPeriod = periodsLogged[periodsLogged.length - 1];
    const previousPeriod = periodsLogged[periodsLogged.length - 2];

    const lastHaydhDuration = Math.round((lastPeriod.end - lastPeriod.start) / (1000 * 3600 * 24));
    const previousHaydhDuration = Math.round((previousPeriod.end - previousPeriod.start) / (1000 * 3600 * 24));
    
    // Calculate the Tuhr duration between the two periods
    const tuhrDuration = Math.round((lastPeriod.start - previousPeriod.end) / (1000 * 3600 * 24));

    displayHabits(lastHaydhDuration, previousHaydhDuration, tuhrDuration);
}

function displayHabits(lastHaydhDuration, previousHaydhDuration, tuhrDuration) {
    let resultText = `<strong>Habits Calculated:</strong><br>`;
    resultText += `Last Haydh Duration: ${lastHaydhDuration} days<br>`;
    resultText += `Previous Haydh Duration: ${previousHaydhDuration} days<br>`;
    resultText += `Tuhr Duration: ${tuhrDuration} days<br>`;
    document.getElementById('result').innerHTML = resultText;
}

// Add logic here for users to log additional periods to update habits,
// following the initial habit establishment.
