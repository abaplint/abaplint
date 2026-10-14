import {MaxOneMethodParameterPerLine} from "../../src/rules";
import {testRule, testRuleFixAll, testRuleFixSingle} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: `WRITE hello.`, cnt: 0},
  {abap: `WRITE hello.`, cnt: 0},
  {abap: `
INTERFACE lif.
METHODS apps_scope_token
  IMPORTING
    body TYPE bodyapps_scope_token client_id TYPE str.
ENDINTERFACE.`, cnt: 1},
  {abap: `
INTERFACE lif.
METHODS apps_scope_token
  IMPORTING
    body TYPE bodyapps_scope_token
    client_id TYPE str.
ENDINTERFACE.`, cnt: 0},
];

testRule(tests, MaxOneMethodParameterPerLine);

describe("Rule: max_one_method_parameter_per_line, quick fixes", () => {

  it("two parameters on one line", () => {
    testRuleFixSingle(`
INTERFACE lif.
METHODS apps_scope_token
  IMPORTING
    body TYPE bodyapps_scope_token client_id TYPE str.
ENDINTERFACE.`, `
INTERFACE lif.
METHODS apps_scope_token
  IMPORTING
    body TYPE bodyapps_scope_token
    client_id TYPE str.
ENDINTERFACE.`, new MaxOneMethodParameterPerLine());
  });

  it("optional and value parameters", () => {
    testRuleFixSingle(`
INTERFACE lif.
METHODS foo
  IMPORTING
    a TYPE i OPTIONAL VALUE(b) TYPE i DEFAULT 2.
ENDINTERFACE.`, `
INTERFACE lif.
METHODS foo
  IMPORTING
    a TYPE i OPTIONAL
    VALUE(b) TYPE i DEFAULT 2.
ENDINTERFACE.`, new MaxOneMethodParameterPerLine());
  });

  it("parameters on the METHODS line", () => {
    testRuleFixAll(`
INTERFACE lif.
METHODS foo IMPORTING a TYPE i b TYPE i c TYPE i.
ENDINTERFACE.`, `
INTERFACE lif.
METHODS foo IMPORTING a TYPE i
                      b TYPE i
                      c TYPE i.
ENDINTERFACE.`, new MaxOneMethodParameterPerLine());
  });

  it("different sections on one line", () => {
    testRuleFixAll(`
INTERFACE lif.
METHODS foo IMPORTING a TYPE i EXPORTING b TYPE i CHANGING c TYPE i.
ENDINTERFACE.`, `
INTERFACE lif.
METHODS foo IMPORTING a TYPE i
            EXPORTING b TYPE i
            CHANGING c TYPE i.
ENDINTERFACE.`, new MaxOneMethodParameterPerLine());
  });

  it("different sections, multi line", () => {
    testRuleFixSingle(`
INTERFACE lif.
METHODS foo
  IMPORTING
    a TYPE i EXPORTING b TYPE i.
ENDINTERFACE.`, `
INTERFACE lif.
METHODS foo
  IMPORTING
    a TYPE i
  EXPORTING b TYPE i.
ENDINTERFACE.`, new MaxOneMethodParameterPerLine());
  });

});
