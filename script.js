document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();


    // --- 1. Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check saved theme from localStorage (defaults to dark on first visit)
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.className = savedTheme;
    setThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {

        if (body.classList.contains('light-theme')) {
            body.className = 'dark-theme';
            localStorage.setItem('theme', 'dark-theme');
            setThemeIcon('dark-theme');
        } else {
            body.className = 'light-theme';
            localStorage.setItem('theme', 'light-theme');
            setThemeIcon('light-theme');
        }
    });

    function setThemeIcon(theme) {
        // Swap the sun/moon icon to match the active theme
        themeToggle.innerHTML = theme === 'light-theme'
            ? '<i data-lucide="moon"></i>'
            : '<i data-lucide="sun"></i>';
        lucide.createIcons();
    }


    // --- 2. Mobile Navigation ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close the mobile menu once a link is tapped
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });


    // --- 3. Filtering & Search Logic ---
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clubCards = document.querySelectorAll('.club-card');
    const noResults = document.getElementById('no-results');

    let activeCategory = 'all';
    let searchTerm = '';

    function filterClubs() {
        let visibleCount = 0;

        clubCards.forEach(card => {

            const category = card.dataset.category;
            const name = card.dataset.name.toLowerCase();

            const matchesCategory =
                activeCategory === 'all' ||
                category === activeCategory;

            const matchesSearch =
                name.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                // '' falls back to the CSS flex layout instead of
                // forcing 'block', which would break the card's
                // internal flex spacing (icon/title/footer alignment)
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        noResults.classList.toggle('hidden', visibleCount > 0);
    }


    // Search input — filters on every keystroke
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase().trim();
        filterClubs();
    });


    // Category filter buttons
    filterButtons.forEach(btn => {

        btn.addEventListener('click', () => {

            filterButtons.forEach(b => {
                b.classList.remove('active');
            });

            btn.classList.add('active');

            activeCategory = btn.dataset.category;

            filterClubs();
        });

    });


    // --- 4. FAQ Accordion ---
    // Matches the actual markup: .faq-item > .faq-question + .faq-answer
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {

        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {

            const isOpen = item.classList.contains('active');

            // Close every other open FAQ item first (accordion behaviour)
            faqItems.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-answer').style.maxHeight = null;
            });

            // The 'active' class lives on .faq-item (not the button)
            // because the chevron-rotate rule in CSS targets
            // .faq-item.active .faq-question svg
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });

    });


    // --- 5. Form Validation & Submission ---
    const suggestForm =
        document.getElementById('suggest-form');

    const formSuccess =
        document.getElementById('form-success');

    const resetBtn =
        document.getElementById('reset-form');

    // Basic but real email format check (not just "contains @")
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    suggestForm.addEventListener('submit', (e) => {

        e.preventDefault();

        const clubName =
            document.getElementById('clubName').value;

        const email =
            document.getElementById('email').value;

        const nameError =
            document.getElementById('nameError');

        const emailError =
            document.getElementById('emailError');

        let isValid = true;


        // Validate club name
        if (clubName.trim() === "") {

            nameError.style.display = 'block';
            isValid = false;

        } else {

            nameError.style.display = 'none';
        }


        // Validate email format
        if (!emailPattern.test(email.trim())) {

            emailError.style.display = 'block';
            isValid = false;

        } else {

            emailError.style.display = 'none';
        }


        // Submit form if valid
        if (isValid) {

            suggestForm.classList.add('hidden');
            formSuccess.classList.remove('hidden');

        }

    });


    // "Submit another" — brings the empty form back
    resetBtn.addEventListener('click', () => {

        suggestForm.reset();

        document.getElementById('nameError').style.display = 'none';
        document.getElementById('emailError').style.display = 'none';

        formSuccess.classList.add('hidden');
        suggestForm.classList.remove('hidden');
    });


    // --- 6. Scroll Reveal Animation ---

    const observerOptions = {
        threshold: 0.1
    };


    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform =
                        "translateY(0)";

                    // Stop observing after animation
                    observer.unobserve(entry.target);
                }

            });

        },
        observerOptions
    );


    // Apply animation to all club cards
    document.querySelectorAll('.club-card').forEach(card => {

        card.style.opacity = "0";

        card.style.transform =
            "translateY(30px)";

        card.style.transition =
            "opacity 0.6s ease-out, transform 0.6s ease-out";

        observer.observe(card);

    });


    // --- 7. Initial Club Filter ---
    // Makes sure the clubs are correctly displayed
    // when the page first loads.
    filterClubs();

});
