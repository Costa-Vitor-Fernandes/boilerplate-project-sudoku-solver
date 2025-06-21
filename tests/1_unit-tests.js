const chai = require("chai");
const assert = chai.assert;

const SudokuSolver = require("../controllers/sudoku-solver.js");
const { puzzlesAndSolutions } = require("../controllers/puzzle-strings");
let solver = new SudokuSolver();

suite("UnitTests", () => {
  // #1
  test("Logic handles a valid puzzle string of 81 characters", (done) => {
    const validPuzzle = puzzlesAndSolutions[0][0];
    const result = solver.validate(validPuzzle);
    assert.isTrue(result.valid, "A valid puzzle string should pass validation");
    done();
  });

  // #2
  test("Logic handles a puzzle string with invalid characters (not 1-9 or .)", (done) => {
    const invalidPuzzle =
      "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....-";
    const result = solver.validate(invalidPuzzle);
    assert.isFalse(result.valid);
    assert.deepEqual(result, {
      valid: false,
      error: "Invalid characters in puzzle",
    });
    done();
  });

  // #3
  test("Logic handles a puzzle string that is not 81 characters in length", (done) => {
    const shortPuzzle =
      "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16..."; // 80 chars
    const result = solver.validate(shortPuzzle);
    assert.isFalse(result.valid);
    assert.deepEqual(result, {
      valid: false,
      error: "Expected puzzle to be 81 characters long",
    });
    done();
  });

  // #4
  test("Logic handles a valid row placement", (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isTrue(
      solver.checkRowPlacement(puzzle, "A", "2", "3"),
      "Should be able to place 3 in row A at column 2",
    );
    done();
  });

  // #5
  test("Logic handles an invalid row placement", (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isFalse(
      solver.checkRowPlacement(puzzle, "A", "2", "5"),
      "Should not be able to place 5 in row A",
    );
    done();
  });

  // #6
  test("Logic handles a valid column placement", (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isTrue(
      solver.checkColPlacement(puzzle, "A", "2", "3"),
      "Should be able to place 3 in column 2 at row A",
    );
    done();
  });

  // #7
  test("Logic handles an invalid column placement", (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isFalse(
      solver.checkColPlacement(puzzle, "A", "2", "9"),
      "Should not be able to place 9 in column 2",
    );
    done();
  });

  // #8
  test("Logic handles a valid region (3x3 grid) placement", (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isTrue(
      solver.checkRegionPlacement(puzzle, "A", "2", "3"),
      "Should be able to place 3 in the first region",
    );
    done();
  });

  // #9
  test("Logic handles an invalid region (3x3 grid) placement", (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    assert.isFalse(
      solver.checkRegionPlacement(puzzle, "A", "2", "1"),
      "Should not be able to place 1 in the first region",
    );
    done();
  });

  // #10
  test("Valid puzzle strings pass the solver", (done) => {
    const puzzle = puzzlesAndSolutions[0][0];
    const solution = puzzlesAndSolutions[0][1];
    assert.equal(solver.solve(puzzle), solution);
    done();
  });

  // #11
  test("Invalid puzzle strings fail the solver", (done) => {
    const invalidPuzzle =
      "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....-";
    assert.isFalse(solver.solve(invalidPuzzle));
    done();
  });

  // #12
  test("Solver returns the expected solution for an incomplete puzzle", (done) => {
    const puzzle = puzzlesAndSolutions[1][0];
    const solution = puzzlesAndSolutions[1][1];
    assert.equal(solver.solve(puzzle), solution);
    done();
  });
});
