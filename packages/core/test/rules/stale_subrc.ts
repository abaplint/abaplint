import {expect} from "chai";
import {StaleSubrc} from "../../src/rules/stale_subrc";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Severity} from "../../src/severity";
import {testRule} from "./_utils";

const prefix = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get RETURNING VALUE(rv) TYPE i.
    CLASS-METHODS run.
    CLASS-METHODS old EXCEPTIONS failed.
    METHODS inst.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
  METHOD run.
  ENDMETHOD.
  METHOD old.
  ENDMETHOD.
  METHOD inst.
  ENDMETHOD.
ENDCLASS.

DATA lv TYPE i.
DATA lo TYPE REF TO lcl.
DATA lt TYPE STANDARD TABLE OF i WITH DEFAULT KEY.

START-OF-SELECTION.
`;

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  {abap: prefix + `lv = lcl=>get( ).
IF sy-subrc <> 0.
ENDIF.`, cnt: 1},
  {abap: prefix + `lcl=>run( ).
IF sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: prefix + `CALL METHOD lcl=>run.
CHECK sy-subrc = 0.`, cnt: 1},
  {abap: prefix + `lo->inst( ).
ASSERT sy-subrc = 0.`, cnt: 1},
  {abap: prefix + `lcl=>run( ).
CASE sy-subrc.
  WHEN 0.
ENDCASE.`, cnt: 1},
  {abap: prefix + `lcl=>run( ).
* comment
" comment
IF sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: prefix + `lo = NEW #( ).
IF sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: prefix + `lv = lines( lt ) + lcl=>get( ).
IF sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: prefix + `lv = lcl=>get( ).
IF lv = 1 OR sy-subrc = 0.
ENDIF.`, cnt: 1},
  {abap: prefix + `LOOP AT lt INTO lv.
  lcl=>run( ).
  IF sy-subrc = 0.
  ENDIF.
ENDLOOP.`, cnt: 1},

  {abap: prefix + `lcl=>old( EXCEPTIONS failed = 1 ).
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `CALL METHOD lcl=>old
  EXCEPTIONS
    failed = 1.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `CALL FUNCTION 'SOME_FUNCTION'.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `READ TABLE lt INTO lv INDEX 1.
lv = lines( lt ).
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `READ TABLE lt INTO lv INDEX 1.
lv = 2.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `READ TABLE lt INTO lv INDEX 1.
CLEAR lv.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `lcl=>run( ).
READ TABLE lt INTO lv INDEX 1.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `IF lv = 1.
  lcl=>run( ).
ENDIF.
IF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `lcl=>run( ).
IF lv = 1.
ELSEIF sy-subrc = 0.
ENDIF.`, cnt: 0},
  {abap: prefix + `lcl=>run( ).
IF lv = 1.
ENDIF.`, cnt: 0},
  {abap: prefix + `lcl=>run( ).
lv = sy-subrc.`, cnt: 0},
];

testRule(tests, StaleSubrc);

describe("Rule: stale_subrc, details", () => {
  it("message, position and severity", () => {
    const abap = prefix + `lv = lcl=>get( ).
IF sy-subrc <> 0.
ENDIF.`;
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const issues = new StaleSubrc().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("sy-subrc checked after a method call without EXCEPTIONS, the call does not set sy-subrc");
    expect(issues[0].getStart().getRow()).to.equal(prefix.split("\n").length + 1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });
});
