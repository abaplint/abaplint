import {expect} from "chai";
import {getStatements} from "./_utils";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {StringTemplate} from "../../src/abap/1_lexer/tokens";

// In SQLScript and in Native SQL "|" and "}" are operators or plain comment
// text, they do not start an ABAP string template. abaplint/abaplint#4329
describe("a | or } inside native SQL does not start a string template", () => {

  const names = (abap: string) => getStatements(abap).map(s => s.get().constructor.name);

  const structureIssues = (abap: string) => {
    const reg = new Registry().addFile(new MemoryFile("zcl_r.clas.abap", abap)).parse();
    return reg.findIssues().filter(i => i.getKey() === "structure").map(i => i.getMessage());
  };

  it("AMDP: } in a SQLScript comment, next method still parsed", () => {
    const abap = `CLASS zcl_r DEFINITION PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS a.
    CLASS-METHODS b.
ENDCLASS.
CLASS zcl_r IMPLEMENTATION.
  METHOD a BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.
    declare x integer;
    x = 1; -- closing }
  ENDMETHOD.
  METHOD b BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.
    declare y integer;
  ENDMETHOD.
ENDCLASS.`;
    expect(names(abap).slice(6)).to.deep.equal([
      "ClassImplementation",
      "MethodImplementation", "NativeSQL", "EndMethod",
      "MethodImplementation", "NativeSQL", "EndMethod",
      "EndClass"]);
    expect(structureIssues(abap)).to.deep.equal([]);
  });

  it("AMDP: | in a block comment and || as concatenation", () => {
    const abap = `CLASS zcl_r DEFINITION PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS a.
    CLASS-METHODS b.
ENDCLASS.
CLASS zcl_r IMPLEMENTATION.
  METHOD a BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.
    declare y integer;
    y = 1; /* pipe | here { */
  ENDMETHOD.
  METHOD b BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.
    declare s nvarchar(10);
    s = 'a' || 'b';
  ENDMETHOD.
ENDCLASS.`;
    expect(structureIssues(abap)).to.deep.equal([]);
  });

  it("EXEC SQL: } and | in a comment, ENDEXEC found", () => {
    const abap = `DATA lv TYPE i.
EXEC SQL.
  SELECT 1 INTO :lv FROM dummy -- }
ENDEXEC.
EXEC SQL.
  SELECT 1 INTO :lv FROM dummy -- |
ENDEXEC.
WRITE lv.`;
    expect(names(abap)).to.deep.equal([
      "Data",
      "ExecSQL", "NativeSQL", "EndExec",
      "ExecSQL", "NativeSQL", "EndExec",
      "Write"]);
  });

  it("a string template after the region is still a template", () => {
    const abap = `EXEC SQL.
  SELECT 1 FROM dummy -- }
ENDEXEC.
WRITE |hello|.`;
    const statements = getStatements(abap);
    expect(names(abap)).to.deep.equal(["ExecSQL", "NativeSQL", "EndExec", "Write"]);
    expect(statements[3].getTokens()[1]).to.be.instanceOf(StringTemplate);
  });

  it("a chain fragment named exec sql does not open a region", () => {
    const abap = `DATA: lv_a TYPE i, exec sql.
WRITE |hello|.`;
    const statements = getStatements(abap);
    expect(statements[2].getTokens()[1]).to.be.instanceOf(StringTemplate);
  });
});
