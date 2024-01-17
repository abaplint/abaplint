import {StrictSQL} from "../../src/rules";
import {testRule, testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string, noIssuesAfter = true) {
  testRuleFixSingle(input, expected, new StrictSQL(), undefined, undefined, noIssuesAfter);
}

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: `SELECT * FROM (iv_name) APPENDING TABLE @<lg_tab> WHERE (lv_where).`, cnt: 1},
  {abap: `SELECT * FROM (iv_name) WHERE (lv_where) APPENDING TABLE @<lg_tab>.`, cnt: 0},
  {abap: `SELECT SINGLE data_str FROM (c_tabname) INTO @rv_data WHERE type = @iv_type AND value = @iv_value.`, cnt: 1},
  {abap: `SELECT SINGLE data_str FROM (c_tabname) WHERE type = @iv_type AND value = @iv_value INTO @rv_data.`, cnt: 0},
  {abap: `SELECT * FROM (c_tabname) INTO TABLE @rt_content WHERE type = @iv_type ORDER BY PRIMARY KEY.`, cnt: 1},
  {abap: `SELECT * FROM (c_tabname) WHERE type = @iv_type ORDER BY PRIMARY KEY INTO TABLE @rt_content.`, cnt: 0},
  {abap: `SELECT field1, field2 FROM zfoo
    WHERE created_on IN @it_created_on
    ORDER BY mandt, created_on
    %_HINTS ORACLE 'INDEX(ZFOO~Y20)'
    INTO TABLE @lt_foo ##SUBRC_OK.`, cnt: 0},
  {abap: `SELECT field1, field2 FROM zfoo
    WHERE created_on IN @it_created_on
    ORDER BY mandt, created_on
    %_HINTS ORACLE 'INDEX(ZFOO~Y20)'
    INTO TABLE @lt_foo
    UP TO 100 ROWS ##SUBRC_OK.`, cnt: 0},
];

testRule(tests, StrictSQL);

describe("Rule: strict_sql, quick fixes", () => {

  it("quick fix 1", async () => {
    const abap = `SELECT * FROM (iv_name) APPENDING TABLE @<lg_tab> WHERE (lv_where).`;
    const expected = `SELECT * FROM (iv_name)  WHERE (lv_where) APPENDING TABLE @<lg_tab>.`;
    testFix(abap, expected);
  });

  it("quick fix 2", async () => {
    const abap = `SELECT SINGLE data_str FROM (c_tabname) INTO @rv_data WHERE type = @iv_type AND value = @iv_value.`;
    const expected = `SELECT SINGLE data_str FROM (c_tabname)  WHERE type = @iv_type AND value = @iv_value INTO @rv_data.`;
    testFix(abap, expected);
  });

  it("quick fix 3", async () => {
    const abap = `SELECT * FROM (c_tabname) INTO TABLE @rt_content WHERE type = @iv_type ORDER BY PRIMARY KEY.`;
    const expected = `SELECT * FROM (c_tabname)  WHERE type = @iv_type ORDER BY PRIMARY KEY INTO TABLE @rt_content.`;
    testFix(abap, expected);
  });

});