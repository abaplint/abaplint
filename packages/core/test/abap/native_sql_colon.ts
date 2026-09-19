import {expect} from "chai";
import {getStatements} from "./_utils";
import {NativeSQL} from "../../src/abap/2_statements/statements/_statement";

// In SQLScript and in Native SQL a leading colon reads a host variable,
// ":lv_a", where in ABAP a colon chains a statement. abaplint/abaplint#4307
describe("a colon inside native SQL is not chaining", () => {

  const nativeOf = (abap: string) => getStatements(abap)
    .filter(s => s.get() instanceof NativeSQL)
    .map(s => s.concatTokens());

  it("EXEC SQL: one statement, with its colons", () => {
    const abap = `EXEC SQL.
  SELECT :lv_a AS x, :lv_b AS y INTO :lv_c FROM dummy;
ENDEXEC.`;
    expect(nativeOf(abap)).to.deep.equal(["SELECT :lv_a AS x, :lv_b AS y INTO :lv_c FROM dummy;"]);
  });

  it("AMDP: one statement, with its colons", () => {
    const abap = `CLASS zcl_amdp_probe DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS squares.
ENDCLASS.

CLASS zcl_amdp_probe IMPLEMENTATION.
  METHOD squares BY DATABASE PROCEDURE FOR HDB
                 LANGUAGE SQLSCRIPT
                 OPTIONS READ-ONLY.
    SELECT :a AS x, :b AS y FROM dummy;
  ENDMETHOD.
ENDCLASS.`;
    expect(nativeOf(abap)).to.deep.equal(["SELECT :a AS x, :b AS y FROM dummy;"]);
  });

  it("a colon without a comma keeps its colon too", () => {
    const abap = `EXEC SQL.
  SELECT x INTO :lv_c FROM dummy;
ENDEXEC.`;
    expect(nativeOf(abap)).to.deep.equal(["SELECT x INTO :lv_c FROM dummy;"]);
  });

  it("a method NAMED language is not a native block", () => {
    // the region is opened by "BY DATABASE ... LANGUAGE", not by the word
    // LANGUAGE anywhere in a METHOD statement: a method may be named after
    // it, and chaining would then be off for the rest of an ordinary method
    const abap = `CLASS zcl_probe DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS language.
ENDCLASS.

CLASS zcl_probe IMPLEMENTATION.
  METHOD language.
    WRITE: 'a', 'b'.
  ENDMETHOD.
ENDCLASS.`;
    const statements = getStatements(abap).map(s => s.concatTokens());
    expect(statements).to.include("WRITE 'a',");
    expect(statements).to.include("WRITE 'b'.");
    expect(nativeOf(abap)).to.deep.equal([]);
  });

  it("a pragma before the period still closes the region", () => {
    // the closing keyword is not the last word when a pragma follows it, and
    // a region left open turns chaining off for the rest of the file
    const abap = `REPORT zfoo.
DATA lv_a TYPE i.
EXEC SQL.
  SELECT :lv_a AS x FROM dummy;
ENDEXEC ##NEEDED.
WRITE: 'a', 'b'.`;
    const statements = getStatements(abap).map(s => s.concatTokens());
    expect(statements).to.include("WRITE 'a',");
    expect(statements).to.include("WRITE 'b'.");
  });

  it("and a fragment of a chain does not open one", () => {
    const abap = `DATA: lv_a TYPE i, exec sql.
WRITE: 'a', 'b'.`;
    const statements = getStatements(abap).map(s => s.concatTokens());
    expect(statements).to.include("WRITE 'a',");
    expect(statements).to.include("WRITE 'b'.");
  });

  it("and chaining outside the block still chains", () => {
    // the region has to CLOSE, or the fix would turn off chaining for
    // everything after the first native block in a file
    const abap = `EXEC SQL.
  SELECT :lv_a AS x, :lv_b AS y FROM dummy;
ENDEXEC.
WRITE: 'a', 'b'.`;
    // concatTokens() of a chained statement carries its own separator
    const statements = getStatements(abap).map(s => s.concatTokens());
    expect(statements).to.deep.equal([
      "EXEC SQL.",
      "SELECT :lv_a AS x, :lv_b AS y FROM dummy;",
      "ENDEXEC.",
      "WRITE 'a',",
      "WRITE 'b'.",
    ]);
  });
});
