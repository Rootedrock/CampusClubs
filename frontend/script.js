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
        const isOpen = navLinks.classList.toggle("active");
        mobileToggle.setAttribute("aria-expanded", String(isOpen));
        mobileToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileToggle.setAttribute("aria-expanded", "false");
            mobileToggle.setAttribute("aria-label", "Open navigation");
        });
    });

    // =========================================================
    // 3. CLUB DIRECTORY - BACKEND CONNECTED
    // =========================================================
    const searchInput = document.getElementById("search-input");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const clubGrid = document.getElementById("club-grid");
    const noResults = document.getElementById("no-results");

    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    let activeCategory = params.get("category") || "all";
    let searchTerm = params.get("search") || "";
    let meetingDay = params.get("day") || "all";
    let sortOrder = params.get("sort") || "popular";
    let currentClubs = [];
    searchInput.value = searchTerm;
    document.getElementById("meeting-filter").value = meetingDay === "all" ? "all" : meetingDay;
    document.getElementById("sort-filter").value = sortOrder;
    filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.category === activeCategory));
    document.querySelector("#club-dialog .dialog-close").addEventListener("click", () => document.getElementById("club-dialog").close());
    document.getElementById("club-dialog").addEventListener("click", (event) => { if (event.target === event.currentTarget) event.currentTarget.close(); });

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

                ${(club.tags || []).length ? `<div class="club-tags">${club.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}

                <button class="club-link" type="button" data-club-id="${escapeHtml(club.id)}">
                    View Club
                    <i data-lucide="arrow-up-right"></i>
                </button>
            </article>
        `;
    }

    function renderClubs(clubs) {
        currentClubs = clubs;
        clubs = clubs.filter((club) => {
            const matchesCategory = activeCategory === "all" || club.category.toLowerCase() === activeCategory.toLowerCase();
            const haystack = `${club.name} ${club.description} ${club.category} ${(club.tags || []).join(" ")}`.toLowerCase();
            return matchesCategory && (!searchTerm || haystack.includes(searchTerm.toLowerCase()));
        });
        clubs = clubs.filter((club) => meetingDay === "all" || (club.meetingDay || "").toLowerCase() === meetingDay.toLowerCase());
        clubs.sort((a, b) => sortOrder === "az" ? a.name.localeCompare(b.name) : sortOrder === "newest" ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0) : (b.memberCount || 0) - (a.memberCount || 0));

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
        getClub(club.id).then(({ club: details }) => {
            const dialog = document.getElementById("club-dialog");
            const content = dialog.querySelector(".club-dialog-content");
            const join = details.joinUrl || details.contactEmail || details.instagram || details.discord || details.whatsapp;
            const joinHref = details.joinUrl || (details.contactEmail ? `mailto:${details.contactEmail}` : details.instagram || details.discord || details.whatsapp || "");
            content.innerHTML = `<p class="section-label">${escapeHtml(details.category)}</p><h2 id="club-dialog-title">${escapeHtml(details.name)}</h2><p>${escapeHtml(details.description)}</p><dl><dt>Meeting</dt><dd>${escapeHtml(details.meetingDay || "To be announced")} · ${escapeHtml(details.meetingTime || "To be announced")}</dd><dt>Members</dt><dd>${escapeHtml(details.memberCount ?? "Not listed")}</dd><dt>Location</dt><dd>${escapeHtml(details.location || "Not listed")}</dd><dt>Who can join</dt><dd>${escapeHtml(details.eligibility || "Open to ask the club")}</dd><dt>Fee</dt><dd>${escapeHtml(details.fee || "Not listed")}</dd></dl>${join ? `<a class="btn btn-primary" target="_blank" rel="noopener" href="${escapeHtml(joinHref)}">How to join</a>` : `<p class="join-missing">Contact details have not been added yet. Suggest an update below.</p>`}`;
            dialog.showModal();
        }).catch(() => {
            document.getElementById("club-dialog").showModal();
            document.querySelector(".club-dialog-content").innerHTML = `<h2>${escapeHtml(club.name)}</h2><p>${escapeHtml(club.description)}</p><p>More club details are unavailable while the backend is offline.</p>`;
        });
    }

    async function loadClubs() {
        try {
            clubGrid.style.opacity = "0.6";
            document.getElementById("directory-status").textContent = "Loading clubs…";

            syncDirectoryUrl();
            const data = await getClubs({ search: searchTerm, category: activeCategory });

            renderClubs(data.clubs || []);
            document.getElementById("directory-status").textContent = "";
        } catch (error) {
            console.error("Could not load clubs:", error);
            const cached = getCachedClubs();
            if (cached?.length) {
                renderClubs(cached);
                document.getElementById("directory-status").textContent = "Showing saved club listings; live updates are temporarily unavailable.";
                return;
            }

            const cards = [...clubGrid.querySelectorAll(".club-card")];
            if (cards.length) {
                cards.forEach((card) => {
                    const text = `${card.dataset.name} ${card.textContent}`.toLowerCase();
                    const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
                    const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
                    card.hidden = !(matchesCategory && matchesSearch);
                });
                noResults.classList.toggle("hidden", cards.some((card) => !card.hidden));
                const notice = document.getElementById("directory-status");
                notice.textContent = "Showing saved club listings. Live search is temporarily unavailable.";
            } else {
                clubGrid.innerHTML = `<div class="no-results"><i data-lucide="wifi-off"></i><h3>Unable to load clubs</h3><p>Showing saved listings when available. Please try again shortly.</p></div>`;
                lucide.createIcons();
            }

            // Static HTML cards remain usable when opened directly as file://.
            clubGrid.querySelectorAll(".club-card .club-link").forEach((button) => {
                if (button.closest(".club-card")?.dataset.clubId) return;
                if (button.dataset.fallbackBound) return;
                button.dataset.fallbackBound = "true";
                button.addEventListener("click", () => {
                    const card = button.closest(".club-card");
                    const title = card.querySelector("h3")?.textContent || "Club";
                    const description = card.querySelector("p")?.textContent || "";
                    const meeting = [...card.querySelectorAll(".card-info span")].map((item) => item.textContent.trim()).join(" · ");
                    document.querySelector(".club-dialog-content").innerHTML = `<h2 id="club-dialog-title">${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p><p>${escapeHtml(meeting)}</p><p>Contact details have not been added yet.</p>`;
                    document.getElementById("club-dialog").showModal();
                });
            });
        } finally {
            clubGrid.style.opacity = "1";
        }
    }

    function syncDirectoryUrl() {
        const query = new URLSearchParams();
        if (activeCategory !== "all") query.set("category", activeCategory);
        if (searchTerm) query.set("search", searchTerm);
        if (meetingDay !== "all") query.set("day", meetingDay);
        if (sortOrder !== "popular") query.set("sort", sortOrder);
        history.replaceState(null, "", `${location.pathname}${location.search}#directory${query.size ? `?${query}` : ""}`);
    }

    // Search against the backend.
    let searchTimer;

    searchInput.addEventListener("input", (event) => {
        searchTerm = event.target.value.trim();

        clearTimeout(searchTimer);

        // Small debounce so we don't make an API request on every key instantly.
        searchTimer = setTimeout(loadClubs, 250);
    });

    document.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            searchInput.focus();
        }
    });

    // Category filter.
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((item) => item.classList.remove("active"));

            button.classList.add("active");
            activeCategory = button.dataset.category;
            syncDirectoryUrl();

            loadClubs();
        });
    });

    document.getElementById("meeting-filter").addEventListener("change", (event) => { meetingDay = event.target.value; loadClubs(); });
    document.getElementById("sort-filter").addEventListener("change", (event) => { sortOrder = event.target.value; loadClubs(); });

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
                reason: description,
                website: document.getElementById("website").value
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
