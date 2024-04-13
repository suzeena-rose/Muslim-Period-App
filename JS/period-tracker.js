document.addEventListener('DOMContentLoaded', () => {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarHeader = document.getElementById('calendar-header');
    const calendarDays = document.getElementById('calendar-days');

    let currentDate = new Date();
    let today = new Date();

    function generateCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Array for day names
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        
        calendarHeader.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        calendarDays.innerHTML = '';
    
        // Add day names to the calendar
        daysOfWeek.forEach(day => {
            calendarDays.innerHTML += `<div class="day-name">${day}</div>`;
        });
    
        // Add empty days for the first week
        for (let i = 0; i < firstDay; i++) {
            calendarDays.innerHTML += '<div class="empty-day"></div>';
        }
    
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            // Highlight the current day
            if (i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
                dayDiv.classList.add('current-day');
            }
            // Allow users to highlight days
            dayDiv.addEventListener('click', () => {
                dayDiv.classList.toggle('highlight');
            });
    
            calendarDays.appendChild(dayDiv);
        }
    }
    

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar();
    });

    generateCalendar();
});