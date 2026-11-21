import {expect} from "chai";
import {ForbiddenStatement, ForbiddenStatementConf} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {testRule} from "./_utils";

function config(statements: string[]): ForbiddenStatementConf {
  const conf = new ForbiddenStatementConf();
  conf.statements = statements;
  return conf;
}

const defaultTests = [
  {abap: "parser error", cnt: 0},
  {abap: "READ TABLE tab INDEX 1 INTO row.", cnt: 0},
  {abap: "APPEND row TO tab.", cnt: 0},
  {abap: "CALL FUNCTION 'ZFOO'.", cnt: 0},
];

testRule(defaultTests, ForbiddenStatement, undefined, "test forbidden_statement rule, default config");

const readTableTests = [
  {abap: "parser error", cnt: 0},
  {abap: "READ TABLE tab INDEX 1 INTO row.", cnt: 1},
  {abap: "read table tab with key field = 1 into row binary search.", cnt: 1},
  {abap: "READ REPORT 'ZFOO' INTO tab.", cnt: 0},
  {abap: "row = tab[ 1 ].", cnt: 0},
  {abap: "APPEND row TO tab.", cnt: 0},
  {abap: "* READ TABLE tab INDEX 1 INTO row.", cnt: 0},
  {abap: "WRITE 'READ TABLE'.", cnt: 0},
];

testRule(readTableTests, ForbiddenStatement, config(["READ TABLE"]), "test forbidden_statement rule, READ TABLE");
testRule(readTableTests, ForbiddenStatement, config(["ReadTable"]), "test forbidden_statement rule, ReadTable");
testRule(readTableTests, ForbiddenStatement, config(["read_table"]), "test forbidden_statement rule, read_table");
testRule(readTableTests, ForbiddenStatement, config(["  read  TABLE "]), "test forbidden_statement rule, extra spaces");

const appendTests = [
  {abap: "APPEND row TO tab.", cnt: 1},
  {abap: "APPEND INITIAL LINE TO tab ASSIGNING <row>.", cnt: 1},
  {abap: "INSERT row INTO TABLE tab.", cnt: 0},
  {abap: "INSERT ztab FROM row.", cnt: 0},
  {abap: "APPEND: a TO tab, b TO tab.", cnt: 2},
  {abap: "APPEND a TO tab.\nAPPEND b TO tab.\nINSERT c INTO TABLE tab.", cnt: 2},
];

testRule(appendTests, ForbiddenStatement, config(["APPEND"]), "test forbidden_statement rule, APPEND");

const insertTests = [
  {abap: "APPEND row TO tab.", cnt: 0},
  {abap: "INSERT row INTO TABLE tab.", cnt: 0},
];

testRule(insertTests, ForbiddenStatement, config(["INSERT", "NOT_A_STATEMENT"]),
         "test forbidden_statement rule, entries without a matching statement");

const callFunctionTests = [
  {abap: "CALL FUNCTION 'ZFOO'.", cnt: 1},
  {abap: "CALL FUNCTION 'ZFOO' EXPORTING iv_bar = 1.", cnt: 1},
  {abap: "CALL TRANSACTION 'SE38'.", cnt: 0},
  {abap: "CALL METHOD lo_obj->run.", cnt: 0},
];

testRule(callFunctionTests, ForbiddenStatement, config(["CALL FUNCTION"]), "test forbidden_statement rule, CALL FUNCTION");

const multipleTests = [
  {abap: "READ TABLE tab INDEX 1 INTO row.", cnt: 1},
  {abap: "APPEND row TO tab.", cnt: 1},
  {abap: "SPLIT str AT ',' INTO a b.", cnt: 1},
  {abap: "INSERT row INTO TABLE tab.", cnt: 0},
  {abap: "END-OF-SELECTION.", cnt: 1},
  {abap: "READ TABLE tab INDEX 1 INTO row.\nAPPEND row TO tab.\nSPLIT str AT ',' INTO a b.\nWRITE row.", cnt: 3},
];

testRule(multipleTests, ForbiddenStatement, config(["READ TABLE", "APPEND", "split", "END-OF-SELECTION", "ReadTable"]),
         "test forbidden_statement rule, multiple entries");

describe("Rule: forbidden_statement, details", () => {

  function run(filename: string, abap: string, statements: string[]) {
    const reg = new Registry().addFile(new MemoryFile(filename, abap)).parse();
    const rule = new ForbiddenStatement();
    rule.setConfig(config(statements));
    return rule.initialize(reg).run(reg.getFirstObject()!);
  }

  it("message and position", () => {
    const issues = run("zfoo.prog.abap", "DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.\n  APPEND 1 TO tab.", ["append"]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Statement \"append\" is forbidden");
    expect(issues[0].getKey()).to.equal("forbidden_statement");
    expect(issues[0].getStart().getRow()).to.equal(2);
    expect(issues[0].getStart().getCol()).to.equal(3);
  });

  it("chained statement, one issue per part", () => {
    const issues = run("zfoo.prog.abap", "APPEND: 1 TO tab,\n        2 TO tab.", ["APPEND"]);
    expect(issues.length).to.equal(2);
  });

  it("global class", () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS zcl_foo IMPLEMENTATION.
  METHOD run.
    DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    DATA row TYPE i.
    APPEND 1 TO tab.
    READ TABLE tab INDEX 1 INTO row.
    row = tab[ 1 ].
  ENDMETHOD.
ENDCLASS.`;
    expect(run("zcl_foo.clas.abap", abap, ["READ TABLE"]).length).to.equal(1);
    expect(run("zcl_foo.clas.abap", abap, ["READ TABLE", "APPEND"]).length).to.equal(2);
    expect(run("zcl_foo.clas.abap", abap, []).length).to.equal(0);
  });

  it("program with FORM", () => {
    const abap = `REPORT zfoo.
DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
START-OF-SELECTION.
  PERFORM run.
FORM run.
  DATA row TYPE i.
  READ TABLE tab INDEX 1 INTO row.
  READ TABLE tab INDEX 2 INTO row.
ENDFORM.`;
    expect(run("zfoo.prog.abap", abap, ["READ TABLE"]).length).to.equal(2);
    expect(run("zfoo.prog.abap", abap, ["CALL FUNCTION"]).length).to.equal(0);
  });

});
