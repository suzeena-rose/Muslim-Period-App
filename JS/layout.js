function generateSidebar() {
    const sidebarHTML = `
    <aside>
    <div class="top">
        <div class="logo">
            <img src="./images/logo.png">
            <h2> Muslimah Tracker</h2>
        </div>
        <div class="close" id="close-btn">
            <span class="material-icons-round">close</span>
        </div>
    </div>
    <div class="sidebar">
        <a href="dashboard.html">
            <span class="material-icons-round">grid_view</span>
            <h3>Dashboard</h3> 
        </a>
        <a href="period-tracker.html">
            <span class="material-symbols-rounded">humidity_low</span>
            <h3>Period Tracker</h3> 
        </a>
        <a href="prayers.html">
            <span class="material-symbols-rounded">prayer_times </span>
            <h3>Prayers Tracker</h3> 
        </a>
        <a href="fasts.html">
            <span class="material-icons-round">no_meals</span>
            <h3>Fasts Tracker</h3> 
        </a>
        <a href="knowledge.html">
            <span class="material-icons-round">school</span>
            <h3>Knowledge</h3> 
        </a>
        <a href="account.html">
            <span class="material-icons-round">person</span>
            <h3>Account</h3> 
        </a>
        <a href="settings.html">
            <span class="material-icons-round">settings</span>
            <h3>Settings</h3> 
        </a>
        <a href="javascript:void(0);" id="logoutLink">
        <span class="material-icons-round">logout</span>
        <h3>Logout</h3> 
    </a>
    </div>
</aside> 
<div class="right">
        <div class="top">
            <button id="menu-btn">
                <span class="material-icons-round">menu</span>
            </button>
            <div class="profile">
                <div class="info">
                    <p> Asalamualaikum, <b id="displayName">User</b></p>
                    <small class="text-muted"> </small>
                </div>
            </div>
            <div class="theme-toggler">
                <span class="material-icons-round active">light_mode</span>
                <span class="material-icons-round">dark_mode</span>
            </div>
            </div>
        </div>`;
    return sidebarHTML;
} 
import { auth, signOut } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Inject the sidebar
    const container = document.querySelector('.container');
    const sidebar = generateSidebar();
    container.insertAdjacentHTML('afterbegin', sidebar);

    // Sidebar toggle functionality
    const sideMenu = document.querySelector("aside");
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");
    const themeToggler = document.querySelector(".theme-toggler");

    // Load and apply the saved theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme-variables');
        themeToggler.querySelector('span:nth-child(1)').classList.remove('active');
        themeToggler.querySelector('span:nth-child(2)').classList.add('active');
    } else {
        document.body.classList.remove('dark-theme-variables');
        themeToggler.querySelector('span:nth-child(1)').classList.add('active');
        themeToggler.querySelector('span:nth-child(2)').classList.remove('active');
    }

    menuBtn.addEventListener('click', () => {
        sideMenu.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        sideMenu.style.display = 'none';
    });

    // Change theme and save the selection
    themeToggler.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-variables');

        const isDarkMode = document.body.classList.contains('dark-theme-variables');
        if (isDarkMode) {
            localStorage.setItem('theme', 'dark');
            themeToggler.querySelector('span:nth-child(1)').classList.remove('active');
            themeToggler.querySelector('span:nth-child(2)').classList.add('active');
        } else {
            localStorage.setItem('theme', 'light');
            themeToggler.querySelector('span:nth-child(1)').classList.add('active');
            themeToggler.querySelector('span:nth-child(2)').classList.remove('active');
        }
    });

    const sidebarLinks = document.querySelectorAll('.sidebar a');

    // Function to remove 'active' class from all links and add to the clicked one
    function makeLinkActive(clickedLink) {
        // Remove 'active' class from all links
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        // Add 'active' class to the clicked link
        clickedLink.classList.add('active');
    }

    // Add click event listener to each link in the sidebar
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            makeLinkActive(this); // 'this' refers to the clicked link
        });
    });

    // Check if the href of any link matches the current location and set it as active
    const currentLocation = window.location.pathname.split('/').pop();
    sidebarLinks.forEach(link => {
        if(link.getAttribute('href') === currentLocation) {
            makeLinkActive(link);
        }
    });
// Add logout functionality
const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
    logoutLink.addEventListener('click', function() {
        signOut(auth).then(() => {
            // Sign-out successful.
            window.location.href = '/login.html'; // Redirect to login page after logout
        }).catch((error) => {
            // An error happened during sign out.
            console.error('Logout Error:', error);
        });
    });
}

});

document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the user's name from sessionStorage
    const userName = sessionStorage.getItem('userName');
    
    // If userName is not null, update the display name
    if(userName) {
        document.getElementById('displayName').textContent = userName;
    }
});
