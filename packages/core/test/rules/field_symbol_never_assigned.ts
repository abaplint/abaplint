import {expect} from "chai";
import {FieldSymbolNeverAssigned} from "../../src/rules/field_symbol_never_assigned";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {testRule} from "./_utils";

const types = `TYPES: BEGIN OF ty_row,
         name   TYPE string,
         author TYPE string,
       END OF ty_row.
TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
`;

function form(body: string): string {
  return types + `FORM run.
  DATA lt_rows TYPE ty_rows.
  DATA ls_row TYPE ty_row.
  DATA lv_name TYPE string.
  DATA lr_row TYPE REF TO ty_row.
  FIELD-SYMBOLS <row> TYPE ty_row.
  FIELD-SYMBOLS <attr> TYPE ty_row.
  FIELD-SYMBOLS <any> TYPE any.
` + body + `
ENDFORM.`;
}

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

// reported
  {abap: form(`  LOOP AT lt_rows ASSIGNING <row>.
    CLEAR <attr>-author.
  ENDLOOP.`), cnt: 1},
  {abap: form(`  WRITE <any>.`), cnt: 1},
  {abap: form(`  <attr> = ls_row.`), cnt: 1},
  {abap: form(`  ls_row = <attr>.
  <attr>-name = 'A'.
  CLEAR <attr>.`), cnt: 1},
  {abap: form(`  ls_row = <attr>.
  WRITE <any>.`), cnt: 2},
  {abap: form(`  APPEND <attr> TO lt_rows.`), cnt: 1},
  {abap: form(`  GET REFERENCE OF <attr> INTO lr_row.`), cnt: 1},
  {abap: form(`  IF <attr> IS ASSIGNED.
    WRITE <attr>-name.
  ENDIF.`), cnt: 1},
  {abap: form(`  UNASSIGN <attr>.
  WRITE <attr>-name.`), cnt: 1},
  {abap: form(`  DATA(lv_count) = lines( lt_rows ).
  IF lv_count > 0 AND <attr>-name IS INITIAL.
  ENDIF.`), cnt: 1},
  {abap: form(`  ASSIGN <attr> TO <row>.`), cnt: 1},
  {abap: types + `FORM run.
  DATA lt_rows TYPE ty_rows.
  FIELD-SYMBOLS: <row> TYPE ty_row,
                 <Attr> TYPE ty_row.
  LOOP AT lt_rows ASSIGNING <row>.
    CLEAR <attr>-author.
  ENDLOOP.
ENDFORM.`, cnt: 1},
  {abap: types + `FORM one.
  FIELD-SYMBOLS <row> TYPE ty_row.
  WRITE <row>-name.
ENDFORM.
FORM two.
  DATA lt_rows TYPE ty_rows.
  FIELD-SYMBOLS <row> TYPE ty_row.
  LOOP AT lt_rows ASSIGNING <row>.
  ENDLOOP.
ENDFORM.`, cnt: 1},

// not reported
  {abap: form(`  LOOP AT lt_rows ASSIGNING <attr>.
    CLEAR <attr>-author.
  ENDLOOP.`), cnt: 0},
  {abap: form(`  CLEAR <attr>-author.
  LOOP AT lt_rows ASSIGNING <attr>.
  ENDLOOP.`), cnt: 0},
  {abap: form(`  READ TABLE lt_rows ASSIGNING <attr> INDEX 1.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  READ TABLE lt_rows ASSIGNING <attr> INDEX 1 CASTING.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  ASSIGN ls_row TO <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  ASSIGN lr_row->* TO <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  ASSIGN (lv_name) TO <any>.
  WRITE <any>.`), cnt: 0},
  {abap: form(`  ASSIGN COMPONENT lv_name OF STRUCTURE ls_row TO <any>.
  WRITE <any>.`), cnt: 0},
  {abap: form(`  ASSIGN lt_rows[ 1 ] TO <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  ASSIGN LOCAL COPY OF ls_row TO <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  INSERT ls_row INTO TABLE lt_rows ASSIGNING <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  APPEND INITIAL LINE TO lt_rows ASSIGNING <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  COLLECT ls_row INTO lt_rows ASSIGNING <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  MODIFY TABLE lt_rows FROM ls_row ASSIGNING <attr>.
  WRITE <attr>-name.`), cnt: 0},
  {abap: form(`  LOOP AT lt_rows ASSIGNING <row> GROUP BY <row>-name ASSIGNING <any>.
    LOOP AT GROUP <any> ASSIGNING <attr>.
      WRITE <attr>-name.
    ENDLOOP.
  ENDLOOP.`), cnt: 0},
  {abap: form(`  IF <attr> IS ASSIGNED.
  ENDIF.
  IF NOT <attr> IS ASSIGNED.
  ENDIF.
  CHECK <attr> IS NOT ASSIGNED.
  UNASSIGN <attr>.`), cnt: 0},
  {abap: form(`  READ TABLE lt_rows ASSIGNING FIELD-SYMBOL(<new>) INDEX 1.
  WRITE <new>-name.`), cnt: 0},
  {abap: types + `FIELD-SYMBOLS <global> TYPE ty_row.
FORM run.
  WRITE <global>-name.
ENDFORM.`, cnt: 0},
  {abap: types + `DATA gs_row TYPE ty_row.
FORM run.
  FIELD-SYMBOLS <row> STRUCTURE gs_row DEFAULT gs_row.
  WRITE <row>-name.
ENDFORM.`, cnt: 0},
  {abap: types + `DEFINE _assign.
  ASSIGN &1 TO &2.
END-OF-DEFINITION.
FORM run.
  DATA ls_row TYPE ty_row.
  FIELD-SYMBOLS <row> TYPE ty_row.
  _assign ls_row <row>.
  WRITE <row>-name.
ENDFORM.`, cnt: 0},
  {abap: types + `DATA lt_rows TYPE ty_rows.
FIELD-SYMBOLS <row> TYPE ty_row.
FIELD-SYMBOLS <attr> TYPE ty_row.
LOOP AT lt_rows ASSIGNING <attr>.
  CLEAR <row>-author.
ENDLOOP.`, cnt: 0},
];

testRule(tests, FieldSymbolNeverAssigned);

describe("Rule field_symbol_never_assigned, classes and function modules", () => {

  function findIssues(files: MemoryFile[]) {
    const reg = new Registry();
    for (const file of files) {
      reg.addFile(file);
    }
    reg.parse();
    return new FieldSymbolNeverAssigned().initialize(reg).run(reg.getFirstObject()!);
  }

  function clas(body: string): MemoryFile[] {
    return [new MemoryFile("zcl_foo.clas.abap", `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS zcl_foo IMPLEMENTATION.
  METHOD run.
    DATA lt_rows TYPE string_table.
${body}
  ENDMETHOD.
ENDCLASS.`)];
  }

  function fugr(body: string): MemoryFile[] {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
  <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
      <AREAT>test</AREAT>
      <FUNCTIONS>
        <item>
          <FUNCNAME>ZFOO</FUNCNAME>
        </item>
      </FUNCTIONS>
    </asx:values>
  </asx:abap>
</abapGit>`;
    return [
      new MemoryFile("zfoo.fugr.xml", xml),
      new MemoryFile("zfoo.fugr.saplzfoo.abap", "FUNCTION-POOL zfoo."),
      new MemoryFile("zfoo.fugr.zfoo.abap", `FUNCTION zfoo.
  DATA lt_rows TYPE string_table.
${body}
ENDFUNCTION.`),
    ];
  }

  it("method, reported at the first use", () => {
    const issues = findIssues(clas(`    FIELD-SYMBOLS <type> TYPE string.
    FIELD-SYMBOLS <attr> TYPE string.
    LOOP AT lt_rows ASSIGNING <type>.
      CLEAR <attr>.
      WRITE <attr>.
    ENDLOOP.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Field symbol <attr> is never assigned in this method");
    expect(issues[0].getStart().getRow()).to.equal(12);
    expect(issues[0].getStart().getCol()).to.equal(13);
  });

  it("method, a FOR with its own field symbol is not reported", () => {
    const issues = findIssues(clas(`    FIELD-SYMBOLS <fs> TYPE string.
    lt_rows = VALUE #( FOR <line> IN lt_rows ( <line> ) ).
    ASSIGN lt_rows[ 1 ] TO <fs>.
    WRITE <fs>.`));
    expect(issues.length).to.equal(0);
  });

  it("function module", () => {
    const issues = findIssues(fugr(`  FIELD-SYMBOLS <type> TYPE string.
  FIELD-SYMBOLS <attr> TYPE string.
  LOOP AT lt_rows ASSIGNING <type>.
    CLEAR <attr>.
  ENDLOOP.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Field symbol <attr> is never assigned in this function module");
  });

});
