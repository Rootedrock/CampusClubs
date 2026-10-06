document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    // =========================================================
    // CONFIG
    // =========================================================
    // API calls are handled by api.js.
    // Change API_BASE_URL in api.js after deploying the backend.

    // =========================================================
    // 1. THEME TOGGLE
    // =========================================================
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    const savedTheme = localStorage.getItem("theme") || "dark-theme";
    body.className = savedTheme;
    setThemeIcon(savedTheme);

    themeToggle.addEventListener("click", () => {
        if (body.classList.contains("light-theme")) {
            body.className = "dark-theme";
            localStorage.setItem("theme", "dark-theme");
            setThemeIcon("dark-theme");
        } else {
            body.className = "light-theme";
            localStorage.setItem("theme", "light-theme");
            setThemeIcon("light-theme");
        }
    });

    function setThemeIcon(theme) {
        themeToggle.innerHTML =
            theme === "light-theme"
                ? '<i data-lucide="moon"></i>'
                : '<i data-lucide="sun"></i>';

        lucide.createIcons();
    }

    // =========================================================
    // 2. MOBILE NAVIGATION
    // =========================================================
    const mobileToggle = document.getElementById("mobile-toggle");
    const navLinks = document.getElementById("nav-links");

    mobileToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });

    // =========================================================
    // 3. CLUB DIRECTORY - BACKEND CONNECTED
    // =========================================================
    const searchInput = document.getElementById("search-input");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const clubGrid = document.getElementById("club-grid");
    const noResults = document.getElementById("no-results");

    let activeCategory = "all";
    let searchTerm = "";
    let currentClubs = [];

    const categoryIcons = {
        Technical: "code-2",
        Cultural: "palette",
        Sports: "trophy",
        Social: "users"
    };

    const iconColors = {
        Technical: ["purple", "blue"],
        Cultural: ["pink", "red"],
        Sports: ["green", "cyan"],
        Social: ["orange", "yellow"]
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function createClubCard(club, index) {
        const icon = categoryIcons[club.category] || "users";
        const colors = iconColors[club.category] || ["purple", "blue"];
        const iconColor = colors[index % colors.length];

        return `
            <article
                class="club-card"
                data-category="${escapeHtml(club.category.toLowerCase())}"
                data-name="${escapeHtml(club.name.toLowerCase())}"
                data-club-id="${escapeHtml(club.id)}"
            >
                <div class="card-top">
                    <div class="club-icon ${iconColor}">
                        <i data-lucide="${icon}"></i>
                    </div>

                    <span class="category ${escapeHtml(club.category.toLowerCase())}">
                        ${escapeHtml(club.category)}
                    </span>
                </div>

                <h3>${escapeHtml(club.name)}</h3>

                <p>${escapeHtml(club.description)}</p>

                <div class="card-info">
                    <span>
                        <i data-lucide="calendar"></i>
                        ${escapeHtml(club.meetingDay || "TBA")}
                    </span>

                    <span>
                        <i data-lucide="clock"></i>
                        ${escapeHtml(club.meetingTime || "TBA")}
                    </span>
                </div>

                <button class="club-link" type="button" data-club-id="${escapeHtml(club.id)}">
                    View Club
                    <i data-lucide="arrow-up-right"></i>
                </button>
            </article>
        `;
    }

    function renderClubs(clubs) {
        currentClubs = clubs;

        if (!clubs.length) {
            clubGrid.innerHTML = "";
            noResults.classList.remove("hidden");
            return;
        }

        noResults.classList.add("hidden");
        clubGrid.innerHTML = clubs.map(createClubCard).join("");

        // Re-create Lucide icons after inserting dynamic HTML.
        lucide.createIcons();

        // Apply the same reveal animation to dynamically created cards.
        setupClubAnimations();

        // View Club buttons.
        clubGrid.querySelectorAll(".club-link").forEach((button) => {
            button.addEventListener("click", () => {
                const club = currentClubs.find(
                    (item) => item.id === button.dataset.clubId
                );

                if (club) {
                    showClubDetails(club);
                }
            });
        });
    }

    function showClubDetails(club) {
        // Simple details dialog using the existing page design.
        // No extra CSS is required.
        const message = [
            club.name,
            "",
            `Category: ${club.category}`,
            `Meeting: ${club.meetingDay || "TBA"} at ${club.meetingTime || "TBA"}`,
            `Members: ${club.memberCount ?? "N/A"}`,
            "",
            club.description
        ].join("\n");

        alert(message);
    }

    async function loadClubs() {
        try {
            clubGrid.style.opacity = "0.6";

            const data = await getClubs({
                search: searchTerm,
                category: activeCategory
            });

            renderClubs(data.clubs || []);
        } catch (error) {
            console.error("Could not load clubs:", error);

            clubGrid.innerHTML = `
                <div class="no-results">
                    <i data-lucide="wifi-off"></i>
                    <h3>Unable to load clubs</h3>
                    <p>Please make sure the CampusClubs backend is running.</p>
                </div>
            `;

            noResults.classList.add("hidden");
            lucide.createIcons();
        } finally {
            clubGrid.style.opacity = "1";
        }
    }

    // Search against the backend.
    let searchTimer;

    searchInput.addEventListener("input", (event) => {
        searchTerm = event.target.value.trim();

        clearTimeout(searchTimer);

        // Small debounce so we don't make an API request on every key instantly.
        searchTimer = setTimeout(loadClubs, 250);
    });

    // Category filter.
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((item) => item.classList.remove("active"));

            button.classList.add("active");
            activeCategory = button.dataset.category;

            loadClubs();
        });
    });

    // =========================================================
    // 4. LIVE STATS FROM BACKEND
    // =========================================================
    async function loadStats() {
        try {
            const data = await getStats();

            const stats = document.querySelectorAll(".hero-stats .stat strong");

            if (stats[0]) stats[0].textContent = data.activeClubs;
            if (stats[1]) stats[1].textContent = data.categories;
            if (stats[2]) stats[2].textContent = data.students;
            if (stats[3]) stats[3].textContent = data.suggestions ?? "—";
        } catch (error) {
            console.error("Could not load stats:", error);
            // Keep the HTML values if the backend is unavailable.
        }
    }

    // =========================================================
    // 5. CLUB OF THE MONTH FROM BACKEND
    // =========================================================
    async function loadClubOfTheMonth() {
        try {
            const data = await getClubOfTheMonth();
            const club = data.club;

            const spotlightTitle =
                document.querySelector(".spotlight-content h2");

            const spotlightDescription =
                document.querySelector(".spotlight-content > p");

            const achievements =
                document.querySelector(".spotlight-achievements");

            if (spotlightTitle) {
                spotlightTitle.textContent = club.name;
            }

            if (spotlightDescription) {
                spotlightDescription.textContent =
                    club.spotlight?.summary || club.description;
            }

            if (achievements) {
                const highlights = club.spotlight?.highlights || [];

                achievements.innerHTML = highlights
                    .map(
                        (highlight) => `
                            <li>
                                <i data-lucide="trophy"></i>
                                ${escapeHtml(highlight)}
                            </li>
                        `
                    )
                    .join("");

                lucide.createIcons();
            }
        } catch (error) {
            console.error("Could not load club of the month:", error);
        }
    }

    // =========================================================
    // 6. FAQ ACCORDION
    // =========================================================
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        question.addEventListener("click", () => {
            const isOpen = item.classList.contains("active");

            faqItems.forEach((other) => {
                other.classList.remove("active");
                other.querySelector(".faq-answer").style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add("active");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // =========================================================
    // 7. SUGGEST A CLUB - SEND TO BACKEND
    // =========================================================
    const suggestForm = document.getElementById("suggest-form");
    const formSuccess = document.getElementById("form-success");
    const resetBtn = document.getElementById("reset-form");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    suggestForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const clubName = document.getElementById("clubName").value.trim();
        const email = document.getElementById("email").value.trim();
        const category = document.getElementById("category").value;
        const description =
            document.getElementById("description").value.trim();

        const nameError = document.getElementById("nameError");
        const emailError = document.getElementById("emailError");

        let isValid = true;

        if (!clubName) {
            nameError.style.display = "block";
            isValid = false;
        } else {
            nameError.style.display = "none";
        }

        if (!emailPattern.test(email)) {
            emailError.style.display = "block";
            isValid = false;
        } else {
            emailError.style.display = "none";
        }

        if (!category) {
            isValid = false;
            alert("Please select a category.");
        }

        if (!isValid) return;

        const submitButton = suggestForm.querySelector(
            'button[type="submit"]'
        );

        const originalButtonHTML = submitButton.innerHTML;

        try {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            // Backend expects category names with a capital first letter.
            const formattedCategory =
                category.charAt(0).toUpperCase() + category.slice(1);

            await submitSuggestion({
                clubName,
                email,
                category: formattedCategory,
                reason: description
            });

            await loadStats();

            suggestForm.reset();
            suggestForm.classList.add("hidden");
            formSuccess.classList.remove("hidden");
        } catch (error) {
            console.error("Suggestion submission failed:", error);
            alert(
                error.message ||
                "Unable to submit your suggestion. Please try again."
            );
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonHTML;
            lucide.createIcons();
        }
    });

    resetBtn.addEventListener("click", () => {
        suggestForm.reset();

        document.getElementById("nameError").style.display = "none";
        document.getElementById("emailError").style.display = "none";

        formSuccess.classList.add("hidden");
        suggestForm.classList.remove("hidden");

        lucide.createIcons();
    });

    // =========================================================
    // 8. SCROLL REVEAL ANIMATION
    // =========================================================
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    observer.unobserve(entry.target);
                }
            });
        },
        observerOptions
    );

    function setupClubAnimations() {
        document.querySelectorAll(".club-card").forEach((card) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(30px)";
            card.style.transition =
                "opacity 0.6s ease-out, transform 0.6s ease-out";

            observer.observe(card);
        });
    }

    // =========================================================
    // 9. INITIALIZE EVERYTHING
    // =========================================================
    async function initializeCampusClubs() {
        await Promise.all([
            loadClubs(),
            loadStats(),
            loadClubOfTheMonth()
        ]);
    }

    initializeCampusClubs();

    // Refresh shared counters while the page is open so submissions from
    // other visitors appear without requiring a page reload.
    window.setInterval(() => {
        if (!document.hidden) loadStats();
    }, 15000);
});
