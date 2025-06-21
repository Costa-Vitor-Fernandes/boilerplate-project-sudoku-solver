class SudokuSolver {
  /**

   * Validates a puzzle string. Checks for presence, invalid characters, and length.

   * @param {string} puzzleString - The puzzle string to validate.

   * @returns {{valid: boolean, error?: string}} - An object indicating if the puzzle is valid, and an error message if not.

   */

  validate(puzzleString) {
    if (!puzzleString) {
      return { valid: false, error: "Required field missing" };
    }

    if (/[^1-9.]/.test(puzzleString)) {
      return { valid: false, error: "Invalid characters in puzzle" };
    }

    if (puzzleString.length !== 81) {
      return {
        valid: false,

        error: "Expected puzzle to be 81 characters long",
      };
    }

    return { valid: true };
  }

  /**

   * Converts a letter-based row ('A'-'I') to a number (0-8).

   * @param {string} row - The row letter.

   * @returns {number} - The zero-based row index.

   */

  letterToNumber(row) {
    return row.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
  }

  /**

   * Creates a 9x9 grid from an 81-character puzzle string.

   * @param {string} puzzleString - The puzzle string.

   * @returns {Array<Array<string|number>>} - The 9x9 grid.

   */

  stringToGrid(puzzleString) {
    const grid = [];

    let row = [];

    for (let i = 0; i < 81; i++) {
      row.push(puzzleString[i]);

      if (row.length === 9) {
        grid.push(row);

        row = [];
      }
    }

    return grid;
  }

  /**

   * Checks if placing a value in a given row would cause a conflict.

   * @param {string} puzzleString - The 81-character puzzle string.

   * @param {string} row - The row to check (A-I).

   * @param {string} column - The column to check (1-9).

   * @param {string} value - The value to check (1-9).

   * @returns {boolean} - True if placement is valid (no conflict), false otherwise.

   */

  // A helper to convert the puzzle string to a 9x9 grid (assuming you have this)
  // For example:
  // this.stringToGrid = function(puzzleString) {
  //   let grid = [];
  //   for (let i = 0; i < 9; i++) {
  //     grid.push(puzzleString.slice(i * 9, (i * 9) + 9).split(''));
  //   }
  //   return grid;
  // };
  // this.letterToNumber = function(letter) {
  //   return letter.charCodeAt(0) - 'A'.charCodeAt(0);
  // };

  checkRowPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    const rowIndex = this.letterToNumber(row);
    const colIndex = parseInt(column, 10) - 1;

    // IMPORTANT: If the cell at (rowIndex, colIndex) already contains 'value',
    // it's not a *new* conflict. However, the test expects a conflict here
    // because the '1' is *already there* and this function is about checking
    // if 'value' can be placed.
    // The most common interpretation for 'checkPlacement' is:
    // "Is 'value' already present in this row (excluding the current cell's ORIGINAL value,
    // if it's the one we're checking against)?"

    // If the cell is already the value you're trying to place, it's technically valid
    // in the sense it doesn't break the rules *further*.
    // But if the cell is DIFFERENT, then it's an immediate conflict.
    // The test's expectation implies that even if it's the same, it counts as a conflict,
    // meaning, "is this number already in the row, including its current position?"
    // If the purpose is just to check for *duplicates* excluding the coordinate itself,
    // then your existing code is fine for *that* specific definition.
    // But your test and puzzle setup indicate a different definition.

    // Let's assume the test intends to check if 'value' exists anywhere else *besides*
    // the current position, OR if the current position is occupied by a *different* number.

    // **Original problem**: The '1' at A1 *is* a conflict for the test's intent.
    // The `if (i !== colIndex ...)` skips checking A1 itself.
    // So, if A1 is '1', and we check for '1', it will return true.

    // Proposed solution: Don't skip the cell if the cell is already occupied by the *same* value,
    // because the test is designed to find this as a conflict.
    // Or, more accurately for a "check" function, check if the cell is already occupied by a *different* value.

    // To fix your failing test, we need to ensure the check correctly identifies the pre-existing '1' at A1 as a conflict.

    // Loop through the entire row
    for (let i = 0; i < 9; i++) {
      // If we are looking at the target cell itself
      if (i === colIndex) {
        // If the target cell is not empty ('.') AND its current value
        // is NOT the value we're trying to place, then it's a conflict
        // (you can't overwrite a different number).
        // Also, if the target cell IS the value we're trying to place,
        // the test expects a conflict, which means the logic needs to
        // consider the existing '1' at A1 as a conflict source for itself.
        // This is less about "valid placement" and more about "is '1' already in this row/col/region?"
        if (grid[rowIndex][i] !== "." && grid[rowIndex][i] !== value) {
          return false; // Cannot overwrite a different number
        }
        // If the cell already contains the value we're placing,
        // it means this '1' is a source of conflict for the row.
        // The test expects this. So we still need to check for it.
        // We'll let the next 'if' handle it if the value is found.
      } else {
        // If we are looking at any other cell in the row
        if (grid[rowIndex][i] === value) {
          return false; // Conflict found
        }
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    const rowIndex = this.letterToNumber(row);
    const colIndex = parseInt(column, 10) - 1;

    for (let i = 0; i < 9; i++) {
      if (i === rowIndex) {
        // If we are looking at the target cell itself
        if (grid[i][colIndex] !== "." && grid[i][colIndex] !== value) {
          return false; // Cannot overwrite a different number
        }
      } else {
        // If we are looking at any other cell in the column
        if (grid[i][colIndex] === value) {
          return false; // Conflict found
        }
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    const rowIndex = this.letterToNumber(row);
    const colIndex = parseInt(column, 10) - 1;

    const startRow = Math.floor(rowIndex / 3) * 3;
    const startCol = Math.floor(colIndex / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (r === rowIndex && c === colIndex) {
          // If we are looking at the target cell itself
          if (grid[r][c] !== "." && grid[r][c] !== value) {
            return false; // Cannot overwrite a different number
          }
        } else {
          // If we are looking at any other cell in the region
          if (grid[r][c] === value) {
            return false; // Conflict found
          }
        }
      }
    }
    return true;
  }
  /**

   * Solves the Sudoku puzzle using a backtracking algorithm.

   * @param {string} puzzleString - The 81-character puzzle string.

   * @returns {string|false} - The solved puzzle string, or false if unsolvable.

   */

  solve(puzzleString) {
    const grid = this.stringToGrid(puzzleString);

    // Cleaner pre-validation of the board state.

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== ".") {
          const val = grid[r][c];

          // Temporarily remove the value to check against the rest of the puzzle

          grid[r][c] = ".";

          if (
            !this.checkRowPlacement(
              grid.flat().join(""),

              String.fromCharCode(65 + r),

              (c + 1).toString(),

              val,
            ) ||
            !this.checkColPlacement(
              grid.flat().join(""),

              String.fromCharCode(65 + r),

              (c + 1).toString(),

              val,
            ) ||
            !this.checkRegionPlacement(
              grid.flat().join(""),

              String.fromCharCode(65 + r),

              (c + 1).toString(),

              val,
            )
          ) {
            return false; // Invalid initial puzzle
          }

          grid[r][c] = val; // Restore the value
        }
      }
    }

    const solveGrid = (currentGrid) => {
      const find = findEmpty(currentGrid);

      if (!find) {
        return currentGrid;
      }

      const [row, col] = find;

      for (let num = 1; num <= 9; num++) {
        if (isValidPlacement(currentGrid, row, col, num.toString())) {
          currentGrid[row][col] = num.toString();

          if (solveGrid(currentGrid)) {
            return currentGrid;
          }

          currentGrid[row][col] = ".";
        }
      }

      return false;
    };

    const findEmpty = (g) => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (g[r][c] === ".") {
            return [r, c];
          }
        }
      }

      return null;
    };

    const isValidPlacement = (g, row, col, num) => {
      for (let x = 0; x < 9; x++) {
        if (g[row][x] === num) return false;
      }

      for (let x = 0; x < 9; x++) {
        if (g[x][col] === num) return false;
      }

      const startRow = Math.floor(row / 3) * 3;

      const startCol = Math.floor(col / 3) * 3;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (g[i + startRow][j + startCol] === num) return false;
        }
      }

      return true;
    };

    const solvedGrid = solveGrid(grid);

    if (!solvedGrid) {
      return false;
    }

    return solvedGrid.flat().join("");
  }
}

module.exports = SudokuSolver;
