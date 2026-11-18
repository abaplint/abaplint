import {expect} from "chai";
import {LoopTargetMisuse, LoopTargetMisuseConf} from "../../src/rules/loop_target_misuse";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {testRule} from "./_utils";

const data = `TYPES: BEGIN OF ty_row,
         id   TYPE i,
         text TYPE string,
       END OF ty_row.
DATA lt_a TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA lt_b TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA ls_row TYPE ty_row.
DATA ls_other TYPE ty_row.
DATA lr_row TYPE REF TO ty_row.
DATA lt_texts TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
FIELD-SYMBOLS <ls_row> TYPE ty_row.
`;

const nested = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  // reported
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_row WHERE id = ls_row-id.
  ENDLOOP.
  WRITE ls_row-text.
ENDLOOP.`, cnt: 1},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_row.
  ENDLOOP.
  ls_row-text = 'x'.
  MODIFY lt_a FROM ls_row.
ENDLOOP.`, cnt: 1},
  {abap: data + `LOOP AT lt_a ASSIGNING <ls_row>.
  LOOP AT lt_b ASSIGNING <ls_row>.
  ENDLOOP.
  <ls_row>-text = 'x'.
ENDLOOP.`, cnt: 1},
  {abap: data + `LOOP AT lt_a REFERENCE INTO lr_row.
  LOOP AT lt_b REFERENCE INTO lr_row.
  ENDLOOP.
  WRITE lr_row->text.
ENDLOOP.`, cnt: 1},
  {abap: data + `LOOP AT lt_a INTO DATA(ls_inline).
  LOOP AT lt_b INTO ls_inline.
  ENDLOOP.
  WRITE ls_inline-text.
ENDLOOP.`, cnt: 1},
  {abap: data + `LOOP AT lt_a ASSIGNING FIELD-SYMBOL(<ls_inline>).
  LOOP AT lt_b ASSIGNING <ls_inline>.
  ENDLOOP.
  IF <ls_inline>-id = 2.
  ENDIF.
ENDLOOP.`, cnt: 1},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_other.
    LOOP AT lt_b INTO LS_ROW.
    ENDLOOP.
    WRITE ls_row-text.
  ENDLOOP.
ENDLOOP.`, cnt: 1},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  IF ls_row-id = 2.
    LOOP AT lt_b INTO ls_row.
    ENDLOOP.
  ENDIF.
  WRITE ls_row-text.
ENDLOOP.`, cnt: 1},
  {abap: data + `FORM foo.
  LOOP AT lt_a INTO ls_row.
    LOOP AT lt_b INTO ls_row.
    ENDLOOP.
    WRITE ls_row-text.
  ENDLOOP.
ENDFORM.`, cnt: 1},

  // not reported
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_other WHERE id = ls_row-id.
  ENDLOOP.
  WRITE ls_row-text.
ENDLOOP.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_row.
  ENDLOOP.
ENDLOOP.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  WRITE ls_row-text.
  LOOP AT lt_b INTO ls_row.
    WRITE ls_row-text.
  ENDLOOP.
ENDLOOP.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_row.
  ENDLOOP.
  READ TABLE lt_a INTO ls_row INDEX 1.
  WRITE ls_row-text.
ENDLOOP.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_row.
  ENDLOOP.
  CLEAR ls_row.
  WRITE ls_row-text.
ENDLOOP.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_row.
  ENDLOOP.
  WRITE ls_other-text.
ENDLOOP.
WRITE ls_row-text.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
ENDLOOP.
LOOP AT lt_b INTO ls_row.
ENDLOOP.
WRITE ls_row-text.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  READ TABLE lt_b INTO ls_row WITH KEY id = ls_row-id.
  WRITE ls_row-text.
ENDLOOP.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_other.
  ENDLOOP.
  LOOP AT lt_b INTO ls_other-text.
  ENDLOOP.
  WRITE ls_row-text.
ENDLOOP.`, cnt: 0},
  {abap: data + `LOOP AT lt_a INTO ls_row GROUP BY ls_row-id.
  LOOP AT GROUP ls_row INTO ls_other.
  ENDLOOP.
ENDLOOP.`, cnt: 0},
  {abap: data + `FORM foo.
  LOOP AT lt_a INTO ls_row.
ENDFORM.
FORM bar.
  LOOP AT lt_b INTO ls_row.
  ENDLOOP.
  WRITE ls_row-text.
ENDFORM.`, cnt: 0},
];

testRule(nested, LoopTargetMisuse, {nestedLoop: true, intoFieldSymbol: false}, "loop_target_misuse, nestedLoop");

const into = [
  // reported
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> TYPE ty_row.
  LOOP AT lt_a ASSIGNING <ls_a>.
  ENDLOOP.
  READ TABLE lt_b INTO <ls_a> INDEX 1.
ENDFORM.`, cnt: 1},
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> TYPE ty_row.
  READ TABLE lt_a ASSIGNING <ls_a> INDEX 1.
  LOOP AT lt_b INTO <ls_a>.
  ENDLOOP.
ENDFORM.`, cnt: 1},
  {abap: data + `FORM foo.
  LOOP AT lt_a ASSIGNING FIELD-SYMBOL(<ls_a>).
    READ TABLE lt_b INTO <ls_a> WITH KEY id = <ls_a>-id.
  ENDLOOP.
ENDFORM.`, cnt: 1},
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> TYPE ty_row.
  APPEND INITIAL LINE TO lt_a ASSIGNING <ls_a>.
  READ TABLE lt_b INTO <ls_a> INDEX 1.
ENDFORM.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA lt_a TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    FIELD-SYMBOLS <lv_a> TYPE i.
    READ TABLE lt_a INTO <lv_a> INDEX 2.
    READ TABLE lt_a ASSIGNING <lv_a> INDEX 1.
  ENDMETHOD.
ENDCLASS.`, cnt: 1},

  // not reported
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> TYPE ty_row.
  ASSIGN ls_other TO <ls_a>.
  READ TABLE lt_b INTO <ls_a> INDEX 1.
ENDFORM.`, cnt: 0},
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> TYPE ty_row.
  ASSIGN lr_row->* TO <ls_a>.
  LOOP AT lt_a ASSIGNING <ls_a>.
  ENDLOOP.
  READ TABLE lt_b INTO <ls_a> INDEX 1.
ENDFORM.`, cnt: 0},
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> TYPE any.
  DATA lr_data TYPE REF TO data.
  CREATE DATA lr_data TYPE ty_row.
  ASSIGN lr_data->* TO <ls_a>.
  LOOP AT lt_a INTO <ls_a>.
  ENDLOOP.
ENDFORM.`, cnt: 0},
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> STRUCTURE ty_row DEFAULT ls_other.
  LOOP AT lt_a ASSIGNING <ls_a>.
  ENDLOOP.
  READ TABLE lt_b INTO <ls_a> INDEX 1.
ENDFORM.`, cnt: 0},
  {abap: data + `LOOP AT lt_a ASSIGNING <ls_row>.
ENDLOOP.
READ TABLE lt_b INTO <ls_row> INDEX 1.`, cnt: 0},
  {abap: data + `FORM foo.
  LOOP AT lt_a ASSIGNING <ls_row>.
  ENDLOOP.
  READ TABLE lt_b INTO <ls_row> INDEX 1.
ENDFORM.`, cnt: 0},
  {abap: data + `FORM foo.
  FIELD-SYMBOLS <ls_a> TYPE ty_row.
  LOOP AT lt_a ASSIGNING <ls_a>.
  ENDLOOP.
  READ TABLE lt_texts INTO <ls_a>-text INDEX 1.
  READ TABLE lt_b ASSIGNING <ls_a> INDEX 1.
ENDFORM.`, cnt: 0},
];

testRule(into, LoopTargetMisuse, {nestedLoop: false, intoFieldSymbol: true}, "loop_target_misuse, intoFieldSymbol");

describe("loop_target_misuse, defaults and messages", () => {
  function run(abap: string) {
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    return new LoopTargetMisuse().initialize(reg).run(reg.getFirstObject()!);
  }

  it("both options are on by default", () => {
    const conf = new LoopTargetMisuseConf();
    expect(conf.nestedLoop).to.equal(true);
    expect(conf.intoFieldSymbol).to.equal(true);
  });

  it("nested LOOP, message and position", () => {
    const issues = run(data + `LOOP AT lt_a INTO ls_row.
  LOOP AT lt_b INTO ls_row.
  ENDLOOP.
  WRITE ls_row-text.
ENDLOOP.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Inner LOOP reuses ls_row, the target of the enclosing LOOP, "
      + "which is used after the inner ENDLOOP and then holds a row of the inner table");
    expect(issues[0].getStart().getRow()).to.equal(13);
  });

  it("INTO field symbol, message", () => {
    const issues = run(data + `FORM foo.
  LOOP AT lt_a ASSIGNING FIELD-SYMBOL(<ls_a>).
  ENDLOOP.
  READ TABLE lt_b INTO <ls_a> INDEX 1.
ENDFORM.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("READ TABLE ... INTO <ls_a> overwrites the row the field symbol points to, use ASSIGNING");
  });

  it("the same issue is not reported twice", () => {
    const issues = run(data + `FORM foo.
  LOOP AT lt_a ASSIGNING FIELD-SYMBOL(<ls_a>).
    LOOP AT lt_b INTO <ls_a>.
    ENDLOOP.
    WRITE <ls_a>-text.
  ENDLOOP.
ENDFORM.`);
    expect(issues.length).to.equal(1);
  });
});
