const express = require("express");
const db = require("../db");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

// GET /api/clubs?search=&category=
// Powers the directory grid, the ⌘K search box, and the category pills.
router.get("/", (req, res) => {
  const { search = "", category = "" } = req.query;

  let clubs = db.getAllClubs();

  if (category && category.toLowerCase() !== "all") {
    clubs = clubs.filter(
      (club) => club.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    clubs = clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(term) ||
        club.description.toLowerCase().includes(term) ||
        club.category.toLowerCase().includes(term)
    );
  }

  res.json({ count: clubs.length, clubs });
});

// GET /api/clubs/categories
// Must be declared before "/:id" so "categories" isn't treated as an id.
router.get("/categories", (req, res) => {
  res.json({ categories: db.getCategories() });
});

// GET /api/clubs/club-of-the-month
router.get("/club-of-the-month", (req, res) => {
  const club = db.getClubOfTheMonth();
  if (!club) {
    throw new ApiError(404, "No club of the month is currently set");
  }
  res.json({ club });
});

// GET /api/clubs/stats
// Powers the live club, category, student, and suggestion counts.
router.get("/stats", (req, res) => {
  const clubs = db.getAllClubs();
  const totalStudents = clubs.reduce(
    (sum, club) => sum + (club.memberCount || 0),
    0
  );

  res.json({
    activeClubs: clubs.length,
    categories: db.getCategories().length,
    students: totalStudents,
    suggestions: db.getAllSuggestions().length,
  });
});

// GET /api/clubs/:id
router.get("/:id", (req, res) => {
  const club = db.getClubById(req.params.id);
  if (!club) {
    throw new ApiError(404, `No club found with id "${req.params.id}"`);
  }
  res.json({ club });
});

module.exports = router;
