const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const CLUBS_FILE = path.join(DATA_DIR, "clubs.json");
const SUGGESTIONS_FILE = path.join(DATA_DIR, "suggestions.json");

/**
 * Very small JSON-file "database". This keeps the backend dependency-free
 * (no native modules to compile) and easy to run anywhere. For a
 * production deployment with real concurrent writes, swap this module out
 * for a real database (SQLite/Postgres/etc.) while keeping the same
 * function signatures used by the route files.
 */

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ---- Clubs ----

function getAllClubs() {
  return readJsonFile(CLUBS_FILE);
}

function getClubById(id) {
  return getAllClubs().find((club) => club.id === id) || null;
}

function getClubOfTheMonth() {
  return getAllClubs().find((club) => club.isClubOfTheMonth) || null;
}

function getCategories() {
  const clubs = getAllClubs();
  return [...new Set(clubs.map((club) => club.category))].sort();
}

// ---- Suggestions ----

function getAllSuggestions() {
  return readJsonFile(SUGGESTIONS_FILE);
}

function addSuggestion(suggestion) {
  const suggestions = getAllSuggestions();
  suggestions.push(suggestion);
  writeJsonFile(SUGGESTIONS_FILE, suggestions);
  return suggestion;
}

function deleteSuggestion(id) {
  const suggestions = getAllSuggestions();
  const index = suggestions.findIndex((s) => s.id === id);
  if (index === -1) return false;
  suggestions.splice(index, 1);
  writeJsonFile(SUGGESTIONS_FILE, suggestions);
  return true;
}

module.exports = {
  getAllClubs,
  getClubById,
  getClubOfTheMonth,
  getCategories,
  getAllSuggestions,
  addSuggestion,
  deleteSuggestion,
};
