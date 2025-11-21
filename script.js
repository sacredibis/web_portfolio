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
        title: "E-Commerce Frontend Showcase",
        description: "A responsive, modern shopping interface built with a focus on usability and performance.",
        image: "images/ecommerce-showcase.png", // Placeholder path
        tags: ["React", "Tailwind CSS", "Redux"],
        liveUrl: "https://example.com/ecommerce-live",
        githubUrl: "https://github.com/charleston/ecommerce-repo"
    },
    {
        title: "HTML Email Template Builder",
        description: "A tool to quickly generate and test responsive, cross-client compatible HTML email templates.",
        image: "images/email-builder.png", // Placeholder path
        tags: ["Handlebars", "Inky", "Gulp"],
        liveUrl: "https://example.com/email-builder-live",
        githubUrl: "https://github.com/charleston/email-builder-repo"
    },
    {
        title: "To-Do List with Local Storage",
        description: "A simple, yet powerful task management application using vanilla JavaScript for data persistence.",
        image: "images/todo-app.png", // Placeholder path
        tags: ["Vanilla JS", "HTML5", "CSS3"],
        liveUrl: "https://example.com/todo-live",
        githubUrl: "https://github.com/charleston/todo-repo"
    },
    {
        title: "Portfolio V1 (This Site)",
        description: "The initial version of my professional portfolio, focused on clean design and accessibility.",
        image: "images/portfolio-v1.png", // Placeholder path
        tags: ["HTML", "CSS", "JavaScript"],
        liveUrl: "#home",
        githubUrl: "https://github.com/charleston/portfolio-v1"
    }
    // Add more projects as needed
];

// --- 2. Dynamic Project Card Generation ---
function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');

    if (!projectsGrid) {
        console.error("Projects grid element not found.");
        return;
    }

    projectsData.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        // Add data-category based on the first tag, if needed for future filtering
        card.setAttribute('data-category', project.tags[0] ? project.tags[0].toLowerCase().replace(/\s/g, '-') : 'general');

        const tagsHtml = project.tags.map(tag => `<span>${tag}</span>`).join('');

        // Use a placeholder image with a fallback (onerror) for safety
        const placeholderImgUrl = `https://placehold.co/400x300/e0e7ff/1e40af?text=${encodeURIComponent(project.title)}&font=sans-serif`;
        const imageHtml = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title} Screenshot" 
                     onerror="this.onerror=null; this.src='${placeholderImgUrl}';">
                <div class="project-overlay">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-tags">${tagsHtml}</div>
                        <div class="project-links">
                            <a href="${project.liveUrl}" target="_blank" class="btn btn-secondary btn-sm">View Live</a>
                            <a href="${project.githubUrl}" target="_blank" class="btn btn-secondary btn-sm">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        card.innerHTML = imageHtml;
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
    const formActionUrl = "/.netlify/functions/send-thankyou-email"; 

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
