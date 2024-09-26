import {testRule, testRuleFixSingle} from "./_utils";
import {expect} from "chai";
import {Indentation, IndentationConf} from "../../src/rules/indentation";
import {MemoryFile, Registry} from "../../src";
import {applyEditList} from "../../src/edit_helper";

async function run(file: MemoryFile){
  const reg = new Registry().addFile(file);
  await reg.parseAsync();

  const issues = new Indentation().initialize(reg).run(reg.getFirstObject()!);
  return {reg, issues};
}

const tests = [
  {abap: "add 2 to lv_foo.", cnt: 0},
  {abap: "  add 2 to lv_foo.", cnt: 1},
  {abap: "IF foo = bar.\nmoo = 1.\nENDIF.", cnt: 1},
  {abap: "IF foo = bar.\n  moo = 1.\nENDIF.", cnt: 0},
  {abap: "WHILE foo = bar.\n  moo = 1.\nENDWHILE.", cnt: 0},
  {abap: "DO 2 TIMES.\n  moo = 1.\nENDDO.", cnt: 0},
  {abap: "FUNCTION zfunction.\n  moo = 1.\nENDFUNCTION.", cnt: 0},
  {abap: "METHOD bar.\n  moo = 1.", cnt: 0},
  {abap: "CLASS bar IMPLEMENTATION.\n  moo = 1.", cnt: 0},
  {abap: "START-OF-SELECTION.\nPERFORM run.", cnt: 1},
  {abap: "START-OF-SELECTION.\n  PERFORM run.", cnt: 0},
  {abap: "LOAD-OF-PROGRAM.\nbutton_1 = 'Prefixes'(002).", cnt: 1},
  {abap: "LOAD-OF-PROGRAM.\n  button_1 = 'Prefixes'(002).", cnt: 0},
  {abap: "MODULE foo OUTPUT.\n  foo = boo.\nENDMODULE.", cnt: 0},
  {abap: "MODULE foo OUTPUT.\nfoo = boo.\nENDMODULE.", cnt: 1},
  {abap: "SELECT * FROM vbak INTO TABLE lt_vbak.\nWRITE 'foo'.\n", cnt: 0},
  {abap: "MODULE status_2000 OUTPUT.\n  lcl_app=>status_2000( ).\nENDMODULE.", cnt: 0},
  {abap: "SELECT COUNT(*) FROM zaor_review.\nIF sy-subrc = 0.", cnt: 0},
  {abap: "SELECT COUNT( * ) FROM seocompodf.\nIF sy-subrc = 0.", cnt: 0},
  {abap: "SELECT * FROM vbak INTO ls_vbak.\n  WRITE 'foo'.\nENDSELECT.", cnt: 0},
  {abap: "CLASS foo IMPLEMENTATION.\n  PRIVATE SECTION.\n    foo().", cnt: 0},
  {abap: "CLASS foo IMPLEMENTATION.\n  PRIVATE SECTION.\n    foo().\nENDCLASS.", cnt: 0},
  {abap: "AT SELECTION-SCREEN OUTPUT.\n  WRITE 'sdf'.", cnt: 0},
  {abap: "IF foo = bar.\n  WRITE 'sdf'.\nELSEIF moo = boo.\n  WRITE 'sdf'.", cnt: 0},
  {abap: "INTERFACE zif_swag_handler PUBLIC.\n  METHODS meta.\nENDINTERFACE.", cnt: 0},
  {abap: "TRY.\n  CLEANUP.\nENDTRY.", cnt: 0},

  {abap: "CLASS lcl_test DEFINITION.\n" +
    "  PUBLIC SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "ENDCLASS.\n", cnt: 0},

  {abap: "CLASS lcl_test DEFINITION.\n" +
    "PUBLIC SECTION.\n" +
    "ENDCLASS.\n", cnt: 1},

  {abap: "CLASS lcl_test DEFINITION.\n" +
    "  PUBLIC SECTION.\n" +
    "    DATA: foo TYPE c.\n" +
    "  PRIVATE SECTION.\n" +
    "ENDCLASS.\n", cnt: 0},

  {abap: "AT SELECTION-SCREEN ON EXIT-COMMAND.\n" +
  "  PERFORM exit.\n" +
  "INCLUDE zfsdfoo.\n", cnt: 0},

  {abap: `
IF foo = bar.
  IF moo = foo.
    FIELD-SYMBOLS: <lv_field> TYPE data.

    ASSIGN
      COMPONENT iv_fieldname
      OF STRUCTURE cs_header
      TO <lv_field>.
    ASSERT sy-subrc = 0.
  ENDIF.
ENDIF.`, cnt: 0},

  {abap: `
TEST-INJECTION delete_vars.
  sy-subrc = 0.
END-TEST-INJECTION.`, cnt: 0},

  {abap: `
TEST-SEAM sdf.
  sy-subrc = 0.
END-TEST-SEAM.`, cnt: 0},

  {abap: `
DATA lo_bar TYPE REF TO object.
CASE TYPE OF lo_bar.
  WHEN TYPE zcl_foobar.
ENDCASE.`, cnt: 0},

  {abap: `
DATA lo_bar TYPE REF TO object.
CASE TYPE OF lo_bar.
  WHEN TYPE zcl_foobar.
    WRITE bar.
ENDCASE.`, cnt: 0},

  {abap: `
EXEC SQL.
  TRUNCATE TABLE ZPERF2;
ENDEXEC.`, cnt: 0},

  {abap: `
CATCH SYSTEM-EXCEPTIONS arithmetic_errors = 4 OTHERS = 8.
  WRITE 'hello world'.
ENDCATCH.`, cnt: 0},

  {abap: `
INITIALIZATION.
  PERFORM INIT.
TOP-OF-PAGE.
  PERFORM TOP.`, cnt: 0},

  {abap: `
INITIALIZATION.
  PERFORM INIT.
AT USER-COMMAND.
  PERFORM TOP.`, cnt: 0},

  {abap: `WRITE same. WRITE line.`, cnt: 0},
  {abap: `METHOD foo. ENDMETHOD.`, cnt: 0},
  {abap: `CLASS foo IMPLEMENTATION. METHOD foo. ENDMETHOD. ENDCLASS.`, cnt: 0},
  {abap: `CLASS foo IMPLEMENTATION.
  METHOD foo. ENDMETHOD.
ENDCLASS.`, cnt: 0},
  {abap: `CLASS foo IMPLEMENTATION.
  METHOD foo. ENDMETHOD.
  METHOD bar. ENDMETHOD.
ENDCLASS.`, cnt: 0},

  {abap: `
FORM bar.
  define _macro.
    WRITE bar.
    IF sy-subrc <> 0.
      CONTINUE.
    ENDIF.
  end-of-definition.
  _macro.
  _macro.
ENDFORM.`, cnt: 0},

  {abap: `
FORM bar.
  define _macro.
    WRITE bar.
  end-of-definition.
  IF foo = bar.
    _macro.
  ENDIF.
ENDFORM.`, cnt: 0},

  {abap: `
SELECT * FROM bar "sdfsd
    WHERE moo = 2.
  WRITE 'sdf'.
ENDSELECT.`, cnt: 0},

  {abap: `
* sdfsd
SELECT * FROM bar
    WHERE moo = 2.
  WRITE 'sdf'.
ENDSELECT.`, cnt: 0},

  {abap: `
AT LINE-SELECTION.
  WRITE 'Hello'.
AT SELECTION-SCREEN.
  WRITE 'World'.`, cnt: 0},

  {abap: `
SELECTION-SCREEN BEGIN OF BLOCK table_compare WITH FRAME TITLE TEXT-006.
PARAMETERS p_diff AS CHECKBOX DEFAULT abap_true MODIF ID exl.
SELECTION-SCREEN END OF BLOCK table_compare.`, cnt: 0},

  {abap: `
LOOP AT SCREEN.
  WRITE 2.
ENDLOOP.`, cnt: 0},

  {abap: `
REPORT zfoobar.
TABLES pernr.
START-OF-SELECTION.
GET pernr.
  WRITE pernr-pernr.
END-OF-SELECTION.`, cnt: 0},

  {abap: `
LOOP AT tab INTO row.
  AT FIRST.
    WRITE 2.
  ENDAT.
  AT LAST.
    WRITE 2.
  ENDAT.
ENDLOOP.`, cnt: 0},

];

testRule(tests, Indentation);


const tests2 = [
  {abap: "class ycl_something definition public final.\npublic section.\nendclass.\n", cnt: 0},
  {abap: "interface zif_foobar public.\nmethods foo.\nendinterface.\n", cnt: 0},
  {abap: "write hello.\n", cnt: 0},
  {abap: `
SELECTION-SCREEN BEGIN OF BLOCK table_compare WITH FRAME TITLE TEXT-006.
  PARAMETERS p_diff AS CHECKBOX DEFAULT abap_true MODIF ID exl.
SELECTION-SCREEN END OF BLOCK table_compare.`, cnt: 0},
  {abap: " write hello.\n", cnt: 1},
  {abap: `
SELECTION-SCREEN BEGIN OF BLOCK b4.
  SELECTION-SCREEN BEGIN OF LINE.
    SELECTION-SCREEN POSITION 4.
    PARAMETERS p_repol AS CHECKBOX.
    SELECTION-SCREEN COMMENT 9(30) FOR FIELD p_repol.
  SELECTION-SCREEN END OF LINE.
SELECTION-SCREEN END OF BLOCK b4.`, cnt: 0},
  {abap: `
SELECTION-SCREEN BEGIN OF SCREEN 100 AS SUBSCREEN.
  SELECTION-SCREEN BEGIN OF BLOCK b1.
    SELECT-OPTIONS s_repos FOR gv_repo.
  SELECTION-SCREEN END OF BLOCK b1.
SELECTION-SCREEN END OF SCREEN 100.`, cnt: 0},
  {abap: `
SELECTION-SCREEN BEGIN OF TABBED BLOCK b3 FOR 17 LINES.
  SELECTION-SCREEN TAB (40) tab1 USER-COMMAND push1 DEFAULT SCREEN 0100.
  SELECTION-SCREEN TAB (40) tab2 USER-COMMAND push2 DEFAULT SCREEN 0200.
SELECTION-SCREEN END OF BLOCK b3.`, cnt: 0},
];

const config = new IndentationConf();
config.ignoreGlobalClassDefinition = true;
config.selectionScreenBlockIndentation = true;
config.ignoreGlobalInterface = true;

testRule(tests2, Indentation, config);

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new Indentation());
}

describe("Rule: indentation, test quick fix", () => {

  it("top level", async () => {
    testFix("  WRITE 'hello'.", "WRITE 'hello'.");
  });

  it("inside IF", async () => {
    testFix(`
IF foo = bar.
WRITE 'hello'.
ENDIF.`, `
IF foo = bar.
  WRITE 'hello'.
ENDIF.`);
  });

  it("Chained statement", async () => {
    const filename = "foo.prog.abap";
    const abap = `
FORM foo.
DATA: foo TYPE i,
moo TYPE i,
bar TYPE i.
ENDFORM.`;
    const result = await run(new MemoryFile(filename, abap));
    const edits = [];
    for (const i of result.issues) {
      const edit = i.getDefaultFix();
      if (edit) {
        edits.push(edit);
      }
    }
    applyEditList(result.reg, edits);
    const foo = result.reg.getFileByName(filename);
    expect(foo?.getRaw()).to.contain("\n  DATA: foo");
  });

});
