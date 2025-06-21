const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");
const { puzzlesAndSolutions } = require("../controllers/puzzle-strings");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("POST /api/solve", () => {
    // #1
    test("Solve a puzzle with valid puzzle string: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: puzzlesAndSolutions[0][0] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "solution");
          assert.equal(res.body.solution, puzzlesAndSolutions[0][1]);
          done();
        });
    });

    // #2
    test("Solve a puzzle with missing puzzle string: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .post("/api/solve")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Required field missing" });
          done();
        });
    });

    // #3
    test("Solve a puzzle with invalid characters: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .post("/api/solve")
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5..g..9..1....8.2.3674.3.7.2..9.47...8..1..16....8",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid characters in puzzle" });
          done();
        });
    });

    // #4
    test("Solve a puzzle with incorrect length: POST request to /api/solve", (done) => {
      chai
        .request(server)
        .post("/api/solve")
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5...9..1....8.2.3674.3.7.2..9.47...8..1..16....",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "Expected puzzle to be 81 characters long",
          });
          done();
        });
    });

    // #5
    test("Solve a puzzle that cannot be solved: POST request to /api/solve", (done) => {
      const unsolvablePuzzle =
        "115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....8";
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: unsolvablePuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Puzzle cannot be solved" });
          done();
        });
    });
  });

  suite("POST /api/check", () => {
    // #6
    test("Check a puzzle placement with all fields: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzlesAndSolutions[0][0],
          coordinate: "A2",
          value: "3",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { valid: true });
          done();
        });
    });

    // #7
    test("Check a puzzle placement with single placement conflict: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzlesAndSolutions[0][0],
          coordinate: "A2",
          value: "4",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { valid: false, conflict: ["row"] });
          done();
        });
    });

    // #8
    test("Check a puzzle placement with multiple placement conflicts: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzlesAndSolutions[0][0],
          coordinate: "A1",
          value: "1",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            valid: false,
            conflict: ["row", "column"],
          });
          done();
        });
    });

    // #9
    test("Check a puzzle placement with all placement conflicts: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzlesAndSolutions[0][0],
          coordinate: "A1",
          value: "5",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            valid: false,
            conflict: ["row", "column", "region"],
          });
          done();
        });
    });

    // #10
    test("Check a puzzle placement with missing required fields: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle: puzzlesAndSolutions[0][0], value: "3" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Required field(s) missing" });
          done();
        });
    });

    // #11
    test("Check a puzzle placement with invalid characters: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5..g..9..1....8.2.3674.3.7.2..9.47...8..1..16....8",
          coordinate: "A2",
          value: "3",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid characters in puzzle" });
          done();
        });
    });

    // #12
    test("Check a puzzle placement with incorrect length: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle:
            "1.5..2.84..63.12.7.2..5...9..1....8.2.3674.3.7.2..9.47...8..1..16....",
          coordinate: "A2",
          value: "3",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "Expected puzzle to be 81 characters long",
          });
          done();
        });
    });

    // #13
    test("Check a puzzle placement with invalid placement coordinate: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzlesAndSolutions[0][0],
          coordinate: "L2",
          value: "3",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid coordinate" });
          done();
        });
    });

    // #14
    test("Check a puzzle placement with invalid placement value: POST request to /api/check", (done) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzlesAndSolutions[0][0],
          coordinate: "A2",
          value: "10",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid value" });
          done();
        });
    });
  });
});
