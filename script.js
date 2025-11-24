/**
 * script.js
 *
 * This file contains all the necessary JavaScript logic for the web developer portfolio:
 * 1. Mobile menu toggle functionality.
 * 2. Smooth scrolling for internal navigation links.
 * 3. Dynamic loading of project cards into the #projects section.
 * 4. Handling contact form submission using the Fetch API (simulating a service like Formspree).
 */

// --- 1. Project Data Array ---
// This array holds the data used to dynamically generate project cards.
const projectsData = [
    {
        title: "E-Commerce Showcase V2",
        description: "A responsive, modern shopping interface built with a focus on usability and performance.",
        image: "images/technology-desk_setup.png", // Placeholder path
        tags: ["Webflow", "E-commerce"],
        liveUrl: "https://e-commerce-showcase-v2.design.webflow.com/",
        githubUrl: "https://github.com/sacredibis"
    }
    // Add more projects as needed
];

// --- 2. Dynamic Project Card Generation ---
function loadProjects() {
    const projectsGrid = document.getElementById('projectsContainer');

    if (!projectsGrid) {
        console.error("Projects grid element not found.");
        return;
    }

    projectsData.forEach(project => {
        const card = document.createElement('div');
        const placeholderImgUrl = `https://placehold.co/400x300/e0e7ff/1e40af?text=${encodeURIComponent(project.title)}&font=sans-serif`;
        const cardHtml = `
            <a href="${project.liveUrl}" target="_blank" class="modern-card-container">
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title} Screenshot" 
                         onerror="this.onerror=null; this.src='${placeholderImgUrl}';">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${project.title}</h3>
                    <p class="card-description">${project.description}</p>
                </div>
            </a>
        `;
        card.innerHTML = cardHtml;
        projectsGrid.appendChild(card);
    });
}

// --- 3. Mobile Menu Toggle ---
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');

    if (menuToggle && navMenu) {
        // Toggle menu visibility and hamburger icon animation
        const toggleMenu = () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Accessibility update
            const isExpanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        };

        menuToggle.addEventListener('click', toggleMenu);

        // Close menu when a link is clicked (useful for mobile)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu(); // Closes the menu
                }
            });
        });
    }
}


// --- 4. Smooth Scrolling for Internal Links ---
function setupSmoothScrolling() {
    // Select all links that start with '#' and don't contain '!' (like email links)
    document.querySelectorAll('a[href^="#"]:not([href="#!"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Optional: Focus the target element for accessibility after scroll
                // targetElement.setAttribute('tabindex', '-1');
                // targetElement.focus();
            }
        });
    });
}


// --- 5. Contact Form Handling ---
function setupFormHandling() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    // Updated endpoint for your new Netlify Function
    const formActionUrl = "/api/send-thankyou-email"; 

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 1. Gather data FIRST so we can use it
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries()); // Converts FormData to a standard Object

            // 2. Set loading state
            formStatus.textContent = "Sending message...";
            formStatus.className = 'form-status sending';

            try {
                // 3. Send as JSON (Required for the Netlify Function)
                const response = await fetch(formActionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Content-Type must be JSON
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data) // Convert object to JSON string
                });

                // 4. Handle Response
                if (response.ok) {
                    // Success: Use the email from the data object we created earlier
                    formStatus.textContent = `Message sent successfully! A confirmation email has been sent to ${data.email}.`;
                    formStatus.className = 'form-status success';
                    contactForm.reset(); 
                } else {
                    // Error: Try to parse the error message from the function
                    const errorData = await response.json();
                    const errorMessage = errorData.msg || "Oops! There was a problem submitting your form.";
                    formStatus.textContent = `Error: ${errorMessage}`;
                    formStatus.className = 'form-status error';
                }

            } catch (error) {
                console.error('Submission failed:', error);
                formStatus.textContent = "Network error. Please try again later or email me directly.";
                formStatus.className = 'form-status error';
            }
        });
    }
}


// --- 6. Initialization ---
// Run all setup functions once the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupMobileMenu();
    setupSmoothScrolling();
    setupFormHandling();
});

// Optional: Add a subtle fade-in animation for content sections on load (based on CSS snippet)
document.addEventListener('DOMContentLoaded', () => {
    // Find all sections
    const sections = document.querySelectorAll('section');

    // Create an Intersection Observer
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If the element is visible, add the 'fade-in' class (assuming CSS has this rule)
                entry.target.classList.add('fade-in'); 
                // Stop observing once it has faded in
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the item is visible
    });

    // Observe each section
    sections.forEach(section => {
        // Add a class that acts as the starting opacity (0) if your CSS requires it
        section.classList.add('initial-hidden'); 
        observer.observe(section);
    });
});
