import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {DangerousStatement, DangerousStatementConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "EXEC SQL.", cnt: 1},
  {abap: "CALL 'SYST_LOGOFF'.", cnt: 1},
  {abap: "parser error", cnt: 0},
  {abap: "SYSTEM-CALL foo.", cnt: 1},
  {abap: "INSERT REPORT lv_prog FROM lt_tab VERSION 'X'.", cnt: 1},

  {abap: "UPDATE /dmo/flight SET (dynamicUpdate) WHERE carrier_id = @carrierId AND connection_id = @connectionId.", cnt: 1},
  {abap: "UPDATE /dmo/flight SET foo = 2 WHERE carrier_id = @carrierId AND connection_id = @connectionId.", cnt: 0},
  {abap: "SELECT * FROM /dmo/flight WHERE (sql) INTO table @DATA(results).", cnt: 1},
  {abap: "SELECT * FROM /dmo/flight WHERE foo = bar INTO table @DATA(results).", cnt: 0},
  {abap: "SELECT * FROM (dbTable) INTO TABLE @<results> UP TO 100 ROWS.", cnt: 1},
  {abap: "SELECT * FROM tab INTO TABLE @<results> UP TO 100 ROWS.", cnt: 0},
// this is hardcoded dynamic, so no SQL injection possible, at all,
  {abap: "SELECT * FROM ssyntaxstructure INTO TABLE @DATA(gt_syntax) WHERE (`proglang IS NULL`).", cnt: 0},
];

testRule(tests, DangerousStatement);

describe("dangerous_statement RAP query provider", () => {
  const abap = `
INTERFACE if_rap_query_provider.
  METHODS select.
ENDINTERFACE.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_rap_query_provider.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD if_rap_query_provider~select.
    SELECT * FROM /dmo/flight WHERE (sql) INTO TABLE @DATA(results).
  ENDMETHOD.
ENDCLASS.`;

  it("ignores dynamic SQL by default", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_rap.clas.abap", abap)).parse();
    const issues = new DangerousStatement().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(0);
  });

  it("finds dynamic SQL in RAP provider method when configured off", () => {
    const conf = new DangerousStatementConf();
    conf.ignoreRAPQueryProvider = false;
    const rule = new DangerousStatement();
    rule.setConfig(conf);
    const reg = new Registry().addFile(new MemoryFile("zcl_rap.clas.abap", abap)).parse();
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
  });
});
