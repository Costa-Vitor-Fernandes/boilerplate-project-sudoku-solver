"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;

    // Check for missing fields

    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }

    // Validate the puzzle string

    const puzzleValidation = solver.validate(puzzle);

    if (!puzzleValidation.valid) {
      // The solver's validate method returns the correct error messages for this case

      return res.json({ error: puzzleValidation.error });
    }

    // Validate coordinate format (e.g., 'A1', 'I9')

    if (!/^[A-I][1-9]$/i.test(coordinate)) {
      return res.json({ error: "Invalid coordinate" });
    }

    // Validate value is a number between 1 and 9

    if (!/^[1-9]$/.test(value)) {
      return res.json({ error: "Invalid value" });
    }

    const row = coordinate.slice(0, 1);

    const column = coordinate.slice(1);

    const conflicts = [];

    const isRowValid = solver.checkRowPlacement(puzzle, row, column, value);

    const isColValid = solver.checkColPlacement(puzzle, row, column, value);

    const isRegionValid = solver.checkRegionPlacement(
      puzzle,

      row,

      column,

      value,
    );

    if (!isRowValid) conflicts.push("row");

    if (!isColValid) conflicts.push("column");

    if (!isRegionValid) conflicts.push("region");

    if (conflicts.length > 0) {
      return res.json({ valid: false, conflict: conflicts });
    }
    return res.json({ valid: true });
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;

    // Validate the puzzle string. The solver's validate handles all cases.

    const puzzleValidation = solver.validate(puzzle);

    if (!puzzleValidation.valid) {
      return res.json({ error: puzzleValidation.error });
    }

    const solution = solver.solve(puzzle);

    if (!solution) {
      return res.json({ error: "Puzzle cannot be solved" });
    }

    return res.json({ solution });
  });
};
