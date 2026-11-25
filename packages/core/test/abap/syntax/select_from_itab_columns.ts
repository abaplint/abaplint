import {expect} from "chai";
import {runProgram} from "./syntax";

// activation on a system 2026-11-25: "Unknown column name TAPOS"
const header = `
TYPES: BEGIN OF ty,
         lgnum TYPE c LENGTH 4,
         tanum TYPE n LENGTH 12,
         vlpla TYPE c LENGTH 18,
       END OF ty.
DATA lt_rows TYPE STANDARD TABLE OF ty WITH EMPTY KEY.
DATA lt_strings TYPE string_table.
`;

describe("syntax.ts, SELECT FROM @itab, columns of the line type", () => {

  it("ORDER BY an unknown column", () => {
    const issues = runProgram(header + `
SELECT * FROM @lt_rows AS ltak ORDER BY lgnum, tanum, tapos INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal("Unknown column name tapos");
  });

  it("ORDER BY an unknown column, without commas", () => {
    const issues = runProgram(header + `
SELECT * FROM @lt_rows AS ltak ORDER BY lgnum tapos INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal("Unknown column name tapos");
  });

  it("ORDER BY an unknown column with the alias", () => {
    const issues = runProgram(header + `
SELECT * FROM @lt_rows AS ltak ORDER BY ltak~tapos INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal("Unknown column name tapos");
  });

  it("field list, unknown column", () => {
    const issues = runProgram(header + `
SELECT lgnum, tapos FROM @lt_rows AS ltak INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal("Unknown column name tapos");
  });

  it("GROUP BY, unknown column", () => {
    const issues = runProgram(header + `
SELECT lgnum, COUNT(*) AS cnt FROM @lt_rows AS ltak GROUP BY lgnum, tapos INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal("Unknown column name tapos");
  });

  it("known columns, ok", () => {
    const issues = runProgram(header + `
SELECT lgnum, tanum FROM @lt_rows AS ltak WHERE vlpla = 'A' ORDER BY ltak~lgnum, tanum DESCENDING INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("aggregate and GROUP BY with known columns, ok", () => {
    const issues = runProgram(header + `
SELECT lgnum, COUNT(*) AS cnt FROM @lt_rows AS ltak GROUP BY lgnum ORDER BY lgnum INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("elementary line type, not checked", () => {
    const issues = runProgram(header + `
SELECT table_line FROM @lt_strings AS s ORDER BY table_line INTO TABLE @DATA(lt_res).`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});
