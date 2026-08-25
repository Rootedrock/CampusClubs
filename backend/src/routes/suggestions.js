const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { ApiError } = require("../middleware/errorHandler");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

const VALID_CATEGORIES = ["Technical", "Cultural", "Sports", "Social"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSuggestionPayload(body) {
  const errors = [];
  const clubName = (body.clubName || "").trim();
  const email = (body.email || "").trim();
  const category = (body.category || "").trim();
  const reason = (body.reason || "").trim();

  if (!clubName) errors.push("Please enter a club name.");
  if (!EMAIL_REGEX.test(email)) errors.push("Please enter a valid email.");
  if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}.`);
  }

  return { errors, clean: { clubName, email, category, reason } };
}

// POST /api/suggestions
// Powers the "Suggest a Club" form submission.
router.post("/", (req, res) => {
  const { errors, clean } = validateSuggestionPayload(req.body || {});

  if (errors.length > 0) {
    throw new ApiError(422, errors.join(" "));
  }

  const suggestion = {
    id: crypto.randomUUID(),
    ...clean,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  db.addSuggestion(suggestion);

  res.status(201).json({
    message: "Thanks for helping improve the campus directory.",
    suggestion,
  });
});

// GET /api/suggestions  (admin only)
router.get("/", requireAdmin, (req, res) => {
  res.json({ suggestions: db.getAllSuggestions() });
});

// DELETE /api/suggestions/:id  (admin only)
router.delete("/:id", requireAdmin, (req, res) => {
  const deleted = db.deleteSuggestion(req.params.id);
  if (!deleted) {
    throw new ApiError(404, `No suggestion found with id "${req.params.id}"`);
  }
  res.status(204).send();
});

module.exports = router;
