import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Hover} from "../../src/lsp/hover";
import {IFile} from "../../src/files/_ifile";
import {ITextDocumentPositionParams} from "../../src/lsp/_interfaces";
import {MemoryFile} from "../../src/files/memory_file";

function buildPosition(file: IFile, row: number, column: number): ITextDocumentPositionParams {
  return {
    textDocument: {uri: file.getFilename()},
    position: LServer.Position.create(row, column),
  };
}

describe("LSP, hover", () => {

  const ztab = `
  <?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <DD02V>
      <TABNAME>ZTAB</TABNAME>
      <DDLANGUAGE>E</DDLANGUAGE>
      <TABCLASS>TRANSP</TABCLASS>
      <DDTEXT>transparent table</DDTEXT>
      <CONTFLAG>A</CONTFLAG>
     </DD02V>
     <DD09L>
      <TABNAME>ZTAB</TABNAME>
      <AS4LOCAL>A</AS4LOCAL>
      <TABKAT>0</TABKAT>
      <TABART>APPL0</TABART>
      <BUFALLOW>N</BUFALLOW>
     </DD09L>
     <DD03P_TABLE>
      <DD03P>
       <TABNAME>ZTAB</TABNAME>
       <FIELDNAME>FIELD1</FIELDNAME>
       <DDLANGUAGE>E</DDLANGUAGE>
       <POSITION>0001</POSITION>
       <KEYFLAG>X</KEYFLAG>
       <ADMINFIELD>0</ADMINFIELD>
       <INTTYPE>C</INTTYPE>
       <INTLEN>000040</INTLEN>
       <NOTNULL>X</NOTNULL>
       <DATATYPE>CHAR</DATATYPE>
       <LENG>000020</LENG>
       <MASK>  CHAR</MASK>
      </DD03P>
      <DD03P>
       <TABNAME>ZTAB</TABNAME>
       <FIELDNAME>VALUE1</FIELDNAME>
       <DDLANGUAGE>E</DDLANGUAGE>
       <POSITION>0002</POSITION>
       <ADMINFIELD>0</ADMINFIELD>
       <INTTYPE>X</INTTYPE>
       <INTLEN>000004</INTLEN>
       <DATATYPE>INT4</DATATYPE>
       <LENG>000010</LENG>
       <MASK>  INT4</MASK>
      </DD03P>
     </DD03P_TABLE>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  it("not resolved", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 7));
    expect(hover).to.equal(undefined);
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("resolved, local type", () => {
    const file = new MemoryFile("foobar.prog.abap", "TYPES foobar TYPE i.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Type Definition");
  });

  it("resolved, typed", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA foobar TYPE string.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("String", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE 'hello'.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("String");
  });

  it("Comment", () => {
    const file = new MemoryFile("foobar.prog.abap", "* foo bar moo loo hoo");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Comment");
  });

  it("String Template", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE |bar|.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 9));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("String Template");
  });

  it("keyword", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 3));
    expect(hover).to.equal(undefined);
  });

  it.skip("keyworld should not resolve", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA write TYPE i.\nWRITE write.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 3));
    expect(hover).to.equal(undefined);
  });

  it.skip("hover method parameter", async () => {
    const abap = `CLASS lcl_abapgit_zlib_stream DEFINITION.
  PUBLIC SECTION.
    METHODS take_int
      IMPORTING
        !iv_length TYPE i.
ENDCLASS.

CLASS lcl_abapgit_zlib_stream IMPLEMENTATION.
  METHOD take_int.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("foobar.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 4, 12));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("builtin method", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(bar) = condense( |sdfsdfsd| ).");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 16));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Builtin");
    expect(hover?.value).to.contain("CONDENSE");
    expect(hover?.value).to.contain("val");
    expect(hover?.value).to.contain("del");
    expect(hover?.value).to.contain("from");
    expect(hover?.value).to.contain("to");
  });

  it("hover class reference", () => {
    const abap = `CLASS lcl_password_dialog DEFINITION.
  PUBLIC SECTION.
    CONSTANTS c_dynnr TYPE c LENGTH 1 VALUE '1'.
ENDCLASS.
CLASS lcl_password_dialog IMPLEMENTATION.
ENDCLASS.
WRITE lcl_password_dialog=>c_dynnr.`;
    const file = new MemoryFile("foobar.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 6, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("lcl_password_dialog");
  });

  it("hover class reference in method call", () => {
    const abap = `CLASS lcl_class DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run.
ENDCLASS.
CLASS lcl_class IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl_class=>run( ).`;
    const file = new MemoryFile("foobar.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 10, 5));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("lcl_class");
  });

  it("hover global class name", () => {
    const abap = `CLASS zcl_class DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS run.
ENDCLASS.
CLASS zcl_class IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zcl_class.clas.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("zcl_class");
  });

  it("hover global interface name", () => {
    const abap = `INTERFACE zif_interface PUBLIC.
    METHODS sdf.
  ENDINTERFACE.`;
    const file = new MemoryFile("zif_interface.intf.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("zif_interface");
  });

  it("data and interface name identical", () => {
    const abap = `INTERFACE bar.
ENDINTERFACE.
DATA bar.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 2, 6));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.not.contain("Interface");
  });

  it("TYPES with identical DATA name", () => {
    const abap = `TYPES bar TYPE c.
DATA bar.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Type Definition");
  });

  it("Hover read reference", () => {
    const abap = `DATA foo TYPE i.
WRITE foo.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Type: ```i```");
  });

  it("Hover constant in interface", () => {
    const abap = `INTERFACE lif_bar.
  CONSTANTS foo TYPE c VALUE '1'.
ENDINTERFACE.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 13));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("read_only");
  });

  it("Hover inferred type", () => {
    const abap = `CLASS lcl_bar DEFINITION.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.
DATA bar TYPE REF TO lcl_bar.
bar = NEW #( ).`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 5, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Inferred");
    expect(hover?.value).to.contain("lcl_bar");
  });

  it("Hover inferred type, COND inside string template", () => {
    const abap = `DATA input TYPE string.
DATA(result) = |foo { COND #( WHEN input IS INITIAL THEN \`you\` ELSE input ) } bar|.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 27));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Inferred");
  });

  it("Hover inferred type, types table", () => {
    const abap = `TYPES type_e_letter TYPE c LENGTH 1.
TYPES type_t_letter TYPE STANDARD TABLE OF type_e_letter WITH NON-UNIQUE DEFAULT KEY.
DATA rt_letter TYPE type_t_letter.
INSERT CONV #( 'a' ) INTO TABLE rt_letter.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 3, 12));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Inferred");
    expect(hover?.value).to.contain("type_e_letter");
  });

  it("Hover inferred row type", () => {
    const abap = `FORM bar.
  TYPES: BEGIN OF ty_stru,
    field TYPE i,
    END OF ty_stru.
  TYPES: ty_tab TYPE STANDARD TABLE OF ty_stru WITH DEFAULT KEY.
  DATA tab TYPE ty_tab.
  APPEND VALUE #( field = 1 ) TO tab.
ENDFORM.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 6, 15));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Inferred");
    expect(hover?.value).to.contain("ty_stru");
  });

  it("Hover inferred type, SWITCH", () => {
// yes, CHAR 6 is correct, the code is bad because it has different types in THEN clauses
    const abap = `DATA bottle TYPE i.
DATA(left) = SWITCH #( bottle - 1
  WHEN 0 THEN 'bottle'
  WHEN 1 THEN 'no more bottles'
  ELSE |{ bottle - 1 } bottles| ).`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 20));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Inferred");
    expect(hover?.value).to.contain("c LENGTH 6");
  });

  it("Hover data element", () => {
    const xml = `
    <?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <DD04V>
        <ROLLNAME>ZDDIC</ROLLNAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <DATATYPE>CHAR</DATATYPE>
        <LENG>000002</LENG>
        <OUTPUTLEN>000002</OUTPUTLEN>
       </DD04V>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const abap = `REPORT zfoo.
DATA foo TYPE zddic.`;
    const dtel = new MemoryFile("zddic.dtel.xml", xml);
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file, dtel]).parse();
    reg.findIssues();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 1, 6));
    expect(hoverVariable).to.not.equal(undefined, "variable");
    expect(hoverVariable?.value).to.contain("ZDDIC");

    const hoverDDIC = new Hover(reg).find(buildPosition(file, 1, 15));
    expect(hoverDDIC).to.not.equal(undefined, "ddic");
    expect(hoverDDIC?.value).to.contain("ZDDIC");
  });

  it("Hover method definition name", () => {
    const abap = `CLASS lcl_bar DEFINITION.
PUBLIC SECTION.
METHODS foo.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
METHOD foo.
ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 2, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Method");
  });

  it("Hover ddic table", () => {
    const abap = `DATA foo TYPE STANDARD TABLE OF ztab.`;
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file, tabl]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 6));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("FIELD1");
  });

  it("Hover function module name", () => {
    const abap = `CALL FUNCTION 'SOMETHING_SOMETHING'.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 20));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("SOMETHING");
    expect(hoverVariable?.value).to.contain("Function Module");
  });

  it("Hover, show method defiontion/parameters", () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS name
      IMPORTING bar        TYPE string OPTIONAL
      RETURNING VALUE(ret) TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD name.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl_bar=>name( ).`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 12, 12));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("name");
    expect(hoverVariable?.value).to.contain("bar");
    expect(hoverVariable?.value).to.contain("ret");
  });

  it("Hover, show method defiontion/parameters, interface", () => {
    const abap = `INTERFACE lif_bar.
  METHODS name RETURNING VALUE(val) TYPE i.
ENDINTERFACE.
DATA bar TYPE REF TO lif_bar.
bar->name( ).`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 4, 7));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("val");
  });

  it("Hover, INTERFACES", () => {
    const abap = `INTERFACE lif.
ENDINTERFACE.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 4, 16));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("lif");
  });

  it("Hover, exception name", () => {
    const abap = `CLASS lcx_error DEFINITION.
ENDCLASS.
CLASS lcx_error IMPLEMENTATION.
ENDCLASS.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar RAISING lcx_error.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 6, 25));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("lcx_error");
  });

  it("Hover, object oriented void type", () => {
    const abap = `NEW cl_abapgit_2fa_github_auth( ).`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("Void");
  });

  it("Hover, voided super class", () => {
    const abap = `CLASS zcl_abapgit_repo_online DEFINITION PUBLIC INHERITING FROM cl_abapgit_repo FINAL CREATE PUBLIC.
ENDCLASS.
CLASS zcl_abapgit_repo_online IMPLEMENTATION.
ENDCLASS.`;
    const file = new MemoryFile("zcl_abapgit_repo_online.clas.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 70));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("Void");
  });

  it("Hover, super", () => {
    const abap = `CLASS lcl_super DEFINITION.
ENDCLASS.
CLASS lcl_super IMPLEMENTATION.
ENDCLASS.

CLASS lcl_sub DEFINITION INHERITING FROM lcl_super.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
ENDCLASS.`;
    const file = new MemoryFile("zhover_super.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 5, 45));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("lcl_super");
  });

  it("Hover, create object type", () => {
    const abap = `CLASS lcl_sub DEFINITION.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
ENDCLASS.

DATA bar TYPE REF TO object.
CREATE OBJECT bar TYPE lcl_sub.`;
    const file = new MemoryFile("zhover_create_type.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hover = new Hover(reg).find(buildPosition(file, 6, 25));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("lcl_sub");
  });

  it("Hover, FRIENDS", () => {
    const abap = `CLASS lcl_friend DEFINITION.
ENDCLASS.
CLASS lcl_friend IMPLEMENTATION.
ENDCLASS.
CLASS lcl_bar DEFINITION FRIENDS lcl_friend.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    const file = new MemoryFile("zhover_friends.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hover = new Hover(reg).find(buildPosition(file, 4, 40));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("lcl_friend");
  });

  it("Hover, FOR EVENT", () => {
    const abap = `INTERFACE zif_event.
  EVENTS bar.
ENDINTERFACE.

CLASS zcl_event DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_event.
    METHODS on_event FOR EVENT bar OF zif_event.
ENDCLASS.
CLASS zcl_event IMPLEMENTATION.
  METHOD on_event.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zhover_friends.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hover = new Hover(reg).find(buildPosition(file, 7, 40));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("zif_event");
  });

  it("Hover, both method and class reference", () => {
    const abap = `INTERFACE zif_test.
  METHODS moo.
ENDINTERFACE.

CLASS zcl_test DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_test.
ENDCLASS.
CLASS zcl_test IMPLEMENTATION.
  METHOD zif_test~moo.
    zif_test~moo( ).
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zhover_both.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();
    const hover = new Hover(reg).find(buildPosition(file, 10, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("zif_test");
  });

  it("Hover, interface variable", () => {
    const abap = `INTERFACE zif_test.
  DATA moo TYPE i.
ENDINTERFACE.

CLASS zcl_test DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_test.
    METHODS bar.
ENDCLASS.
CLASS zcl_test IMPLEMENTATION.
  METHOD bar.
    zif_test~moo = 2.
    WRITE zif_test~moo.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zhover_var.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();

    const hover1 = new Hover(reg).find(buildPosition(file, 11, 10));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain("zif_test", "hover1");

    const hover2 = new Hover(reg).find(buildPosition(file, 12, 15));
    expect(hover2).to.not.equal(undefined);
    expect(hover2?.value).to.contain("zif_test", "hover2");
  });

  it("Hover, alias", () => {
    const abap = `INTERFACE zif_test.
  DATA moo TYPE i.
ENDINTERFACE.

CLASS zcl_test DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_test.
    ALIASES bar FOR zif_test~moo.
ENDCLASS.
CLASS zcl_test IMPLEMENTATION.
ENDCLASS.`;
    const file = new MemoryFile("zhover_var.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();

    const hover1 = new Hover(reg).find(buildPosition(file, 7, 25));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain("zif_test", "hover1");
  });

  it("Hover, redefinition", () => {
    const abap = `INTERFACE zif_test.
  METHODS moo.
ENDINTERFACE.

CLASS zcl_super DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_test.
ENDCLASS.
CLASS zcl_super IMPLEMENTATION.
  METHOD zif_test~moo.
  ENDMETHOD.
ENDCLASS.

CLASS zcl_test DEFINITION INHERITING FROM zcl_super.
  PUBLIC SECTION.
    METHODS zif_test~moo REDEFINITION.
ENDCLASS.
CLASS zcl_test IMPLEMENTATION.
  METHOD zif_test~moo.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zhover_var.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();

    const hover1 = new Hover(reg).find(buildPosition(file, 15, 15));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain("Object", "hover1");
    expect(hover1?.value).to.contain("zif_test", "hover1");
  });

  it("Hover, static attributes, source and target", () => {
    const abap = `CLASS zcl_test DEFINITION.
  PUBLIC SECTION.
    METHODS m.
    CLASS-DATA bar TYPE i.
ENDCLASS.
CLASS zcl_test IMPLEMENTATION.
  METHOD m.
    WRITE zcl_test=>bar.
    zcl_test=>bar = 2.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zhover_static.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();

    const hover1 = new Hover(reg).find(buildPosition(file, 7, 15));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain("Object", "hover1");
    expect(hover1?.value).to.contain("zcl_test", "hover1");

    const hover2 = new Hover(reg).find(buildPosition(file, 8, 10));
    expect(hover2).to.not.equal(undefined);
    expect(hover2?.value).to.contain("Object", "hover2");
    expect(hover2?.value).to.contain("zcl_test", "hover2");
  });

  it("Hover, interfaced type", () => {
    const abap = `INTERFACE zif_bar1.
  TYPES type1 TYPE i.
ENDINTERFACE.

CLASS zcl_test DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_bar1.
    DATA foo TYPE zif_bar1~type1.
ENDCLASS.
CLASS zcl_test IMPLEMENTATION.

ENDCLASS.`;
    const file = new MemoryFile("zhover_intf_type.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();

    const hover1 = new Hover(reg).find(buildPosition(file, 7, 25));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain("Object", "hover1");
    expect(hover1?.value).to.contain("zif_bar1", "hover1");
  });

  it("Hover, interfaced chained variable", () => {
    const abap = `INTERFACE lif_properties.
  DATA zoomscale TYPE i.
ENDINTERFACE.

CLASS lcl_worksheet DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_properties.
ENDCLASS.
CLASS lcl_worksheet IMPLEMENTATION.
ENDCLASS.

DATA lo_worksheet TYPE REF TO lcl_worksheet.

IF lo_worksheet->lif_properties~zoomscale GT 400.
ENDIF.`;
    const file = new MemoryFile("zhover_intf_chain.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    reg.findIssues();

    const hover1 = new Hover(reg).find(buildPosition(file, 13, 25));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain("Read From", "hover1");
    expect(hover1?.value).to.contain("lif_properties", "hover1");
  });

  it("hover type in interface should contain fully qualified name", () => {
    const abap = `INTERFACE zif_wasm_value PUBLIC.
  TYPES ty_values TYPE STANDARD TABLE OF REF TO zif_wasm_value WITH DEFAULT KEY.
ENDINTERFACE.`;
    const file = new MemoryFile("zif_interface.intf.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("zif_wasm_value=>ty_values");
  });

  it("hover, type BEGIN OF", () => {
    const abap = `TYPES: BEGIN OF ty_abap_value_mapping,
    target_type TYPE string,
  END OF ty_abap_value_mapping.
DATA(sdf) = VALUE ty_abap_value_mapping-target_type( ).`;
    const file = new MemoryFile("foo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 3, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("ty_abap_value_mapping-target_type");
  });

  it("hover, interface method", () => {
    const abap = `INTERFACE zif_test.
  METHODS moo.
ENDINTERFACE.

CLASS zcl_super DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_test.
ENDCLASS.
CLASS zcl_super IMPLEMENTATION.
  METHOD zif_test~moo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA bar TYPE REF TO zcl_super.
  CREATE OBJECT bar.
  bar->zif_test~moo( ).`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 16, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`Method`);
    expect(hover?.value).to.contain(`{"ooName":"zif_test","ooType":"INTF"}`);
  });

  it("hover, aliased method reference from interface", () => {
    const abap = `INTERFACE zif_test.
  METHODS moo.
ENDINTERFACE.

CLASS zcl_super DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_test.
    ALIASES moo FOR zif_test~moo.
ENDCLASS.
CLASS zcl_super IMPLEMENTATION.
  METHOD zif_test~moo.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA bar TYPE REF TO zcl_super.
  CREATE OBJECT bar.
  bar->moo( ).
ENDFORM.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 17, 8));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`Method`);
    expect(hover?.value).to.contain(`{"ooName":"zif_test","ooType":"INTF"}`);
  });

  it("hover, CATCH oo reference expected", () => {
// note that lcx is not really an excpetion for this test case
    const abap = `CLASS lcx DEFINITION.
ENDCLASS.
CLASS lcx IMPLEMENTATION.
ENDCLASS.
FORM bar.
  TRY.
    CATCH lcx.
  ENDTRY.
ENDFORM.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 6, 12));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`Object`);
  });

  it("hover, MethodImplementationReference", () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS name.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD name.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 5, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`Method Implementation`);
  });

  it("hover, method reference via CALL METHOD", () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS name IMPORTING foo TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD name.
    WRITE / foo.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  PERFORM bar.
FORM bar.
  DATA bar TYPE REF TO lcl_bar.
  CREATE OBJECT bar.
  CALL METHOD bar->name( 1 ).
ENDFORM.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 14, 22));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`Method`);
  });

  it("hover, expect one write reference", () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS bar EXPORTING int TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.
FORM run.
  DATA lo_bar TYPE REF TO lcl_bar.
  DATA lv_int TYPE i.
  CREATE OBJECT lo_bar.
  lo_bar->bar( IMPORTING int = lv_int ).
ENDFORM.
START-OF-SELECTION.
  PERFORM run.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 12, 33));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`Write To`);
    expect(hover?.value.split("Write To").length).to.equal(2);
  });

  it("hover interfaced interface", () => {
    const abap = `INTERFACE top.
  ENDINTERFACE.
  INTERFACE sub.
    INTERFACES top.
  ENDINTERFACE.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 3, 16));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`Object`);
  });

  it("hover voided interfaced interface", () => {
    const abap = `INTERFACE sub.
    INTERFACES voided.
  ENDINTERFACE.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 16));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`(Void)`);
  });

  it("hover voided TYPE sfdsfdsdsfds", () => {
    const abap = `DATA foo TYPE sfdsfdsdsfds.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 20));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`(Void)`);
  });

  it("hover voided TYPE arch_usr", () => {
    const abap = `DATA sdf TYPE arch_usr-arch_comit.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 15));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`(Void)`);
  });

  it("hover voided structured TYPE", () => {
    const abap = `TYPES: BEGIN OF ty,
    obj  TYPE tadir-object,
    name TYPE tadir-obj_name,
  END OF ty.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 16));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`(Void)`);
  });

  it("hover, voided db table", () => {
    const abap = `SELECT * FROM bar INTO TABLE @DATA(sdfds).`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 15));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain(`(Void)`);
  });

  it("hover, expect one void", () => {
    // note that in this case abaplint does not know if its a class or a ddic object
    const abap = `DATA foo TYPE REF TO cl_sdfsd.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 22));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("(Void)");
  });

  it("hover, static modifier", () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA: BEGIN OF bar,
                  field TYPE string,
                END OF bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 2, 26));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("static");
  });

  it("Hover SELECT table", () => {
    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs).`;
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file, tabl]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 22));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("Table");
  });

  it("Hover, nested interfaces", () => {
    const abap = `INTERFACE zif_ajson_reader.
  METHODS members.
ENDINTERFACE.

INTERFACE zif_ajson.
  INTERFACES zif_ajson_reader.
ENDINTERFACE.

CLASS zcl_ajson DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_ajson.
ENDCLASS.
CLASS zcl_ajson IMPLEMENTATION.
  METHOD zif_ajson_reader~members.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 13, 13));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Object");
  });

  it("Hover, implemented interface, check for extras", () => {
    const abap = `INTERFACE lif1.
ENDINTERFACE.

INTERFACE lif2.
  INTERFACES lif1.
ENDINTERFACE.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 4, 15));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Object");
    expect(hover?.value).to.contain("Extra");
  });

  it("Hover, voided exception class", () => {
    const abap = `CLASS test DEFINITION FINAL.
  PUBLIC SECTION.
    METHODS blah RAISING cx_static_check.
ENDCLASS.
CLASS test IMPLEMENTATION.
  METHOD blah.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 2, 30));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Object (Void)");
    expect(hover?.value).to.contain("Extra");
  });

  it("Hover, voided class or interface via type", () => {
    const abap = `DATA properties TYPE if_aff_chko_v1=>ty_main.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 25));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Object (Void)");
    expect(hover?.value).to.contain("Extra");
  });

  it("Hover, voided default value as class or interface", () => {
    const abap = `CONSTANTS foobar TYPE i VALUE if_moo=>constant.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 35));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Object (Void)");
    expect(hover?.value).to.contain("IF_MOO");
  });

  it("Hover, voided LIKE typing", () => {
    const abap = `DATA foo LIKE if_foobar=>field.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 20));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Object (Void)");
    expect(hover?.value).to.contain("IF_FOOBAR");
  });

  it("Hover, voided event handler class class", () => {
    const abap = `CLASS foo DEFINITION.
  PUBLIC SECTION.
    METHODS double_click_wb_navigation
      FOR EVENT double_click OF cl_salv_events_table
      IMPORTING row.
ENDCLASS.

CLASS foo IMPLEMENTATION.
  METHOD double_click_wb_navigation.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 3, 40));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Object (Void)");
    expect(hover?.value).to.contain("Extra");
  });

  it("Hover, enums should have qualified name", () => {
    const abap = `TYPES: BEGIN OF ENUM enum_type_info STRUCTURE type_info,
         string,
         numeric,
       END OF ENUM enum_type_info STRUCTURE type_info.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo RETURNING VALUE(result) TYPE enum_type_info.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    WRITE result.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 10, 12));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("enum_type_info");
  });

  it("Hover, qualified name nested TYPES, basic", () => {
    const abap = `TYPES: BEGIN OF blah,
    foo TYPE string,
  END OF blah.
DATA(sdf) = VALUE blah-foo( ).`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 3, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("blah-foo");
  });

  it("Hover, qualified name nested TYPES, table", () => {
    const abap = `TYPES: BEGIN OF blah,
    foo TYPE STANDARD TABLE OF string WITH EMPTY KEY,
  END OF blah.
DATA(sdf) = VALUE blah-foo( ).`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 3, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("blah-foo");
  });

  it("Hover, qualified name, structure field from type", () => {
    const abap = `INTERFACE zif_aff_types_v1 PUBLIC.
  TYPES ty_original_language TYPE sy-langu.
ENDINTERFACE.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("zif_aff_types_v1=>ty_original_language");
  });

  it("Hover, reference inferred type", () => {
    const abap = `TYPES: BEGIN OF aggregated_data_type,
         count TYPE i,
       END OF aggregated_data_type.
DATA aggregated_data TYPE STANDARD TABLE OF aggregated_data_type WITH DEFAULT KEY.
INSERT VALUE #( count = 2 ) INTO TABLE aggregated_data REFERENCE INTO DATA(aggregated_data_row).`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 4, 80));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("count");
  });

  it("hover method references, CALL METHOD vs normal, should be the same", () => {
    const abap = `
INTERFACE lif.
  CLASS-METHODS foo.
ENDINTERFACE.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD lif~foo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  CALL METHOD lcl=>lif~foo.
  lcl=>lif~foo( ).`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover1 = new Hover(reg).find(buildPosition(file, 15, 25));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain(`"ooName":"lif"`);
    const hover2 = new Hover(reg).find(buildPosition(file, 16, 12));
    expect(hover2).to.not.equal(undefined);
    expect(hover2?.value).to.contain(`"ooName":"lif"`);
  });

  it("hover, namespaced function group", () => {
    const fmname = `FUNCTION /foo/fmname.
  WRITE 'hello'.
  DATA foobar TYPE i.
ENDFUNCTION.`;
    const bartopabap = `FUNCTION-POOL /foo/bar.`;
    const bartopxml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>/FOO/LBARTOP</NAME>
    <DBAPL>S</DBAPL>
    <DBNA>D$</DBNA>
    <SUBC>I</SUBC>
    <APPL>S</APPL>
    <FIXPT>X</FIXPT>
    <LDBNAME>D$S</LDBNAME>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const saplbarabap = `INCLUDE /foo/lbartop.
INCLUDE /foo/lbaruxx.`;
    const saplbarxml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>/FOO/SAPLBAR</NAME>
    <DBAPL>S</DBAPL>
    <DBNA>D$</DBNA>
    <SUBC>F</SUBC>
    <APPL>S</APPL>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <LDBNAME>D$S</LDBNAME>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AREAT>fugr</AREAT>
   <INCLUDES>
    <SOBJ_NAME>/FOO/LBARTOP</SOBJ_NAME>
    <SOBJ_NAME>/FOO/SAPLBAR</SOBJ_NAME>
   </INCLUDES>
   <FUNCTIONS>
    <item>
     <FUNCNAME>/FOO/FMNAME</FUNCNAME>
     <SHORT_TEXT>hello</SHORT_TEXT>
    </item>
   </FUNCTIONS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const files = [
      {filename: "#foo#bar.fugr.#foo#fmname.abap", contents: fmname},
      {filename: "#foo#bar.fugr.#foo#lbartop.abap", contents: bartopabap},
      {filename: "#foo#bar.fugr.#foo#lbartop.xml", contents: bartopxml},
      {filename: "#foo#bar.fugr.#foo#saplbar.abap", contents: saplbarabap},
      {filename: "#foo#bar.fugr.#foo#saplbar.xml", contents: saplbarxml},
      {filename: "#foo#bar.fugr.xml", contents: xml},
    ].map(e => new MemoryFile(e.filename, e.contents));

    const reg = new Registry().addFiles(files).parse();

    const hover1 = new Hover(reg).find(buildPosition(files[0], 1, 10));
    expect(hover1).to.not.equal(undefined);
    expect(hover1?.value).to.contain(`String`);

    const hover2 = new Hover(reg).find(buildPosition(files[0], 2, 10));
    expect(hover2).to.not.equal(undefined);
    expect(hover2?.value).to.contain(`Variable Definition`);
  });

  it("Hover, conversion exit", () => {
    const abap = `DATA foo TYPE sy-langu.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("ISOLA");
  });

  it("Hover, conversion exit, types", () => {
    const abap = `TYPES foo TYPE sy-langu.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("ISOLA");
  });

  it("Hover, ddic type", () => {
    const abap = `TYPES:
BEGIN OF ty_personalization,
  hide_column TYPE abap_bool,
END OF ty_personalization,
BEGIN OF ty_list_report,
  hide_column TYPE ty_personalization-hide_column,
END OF ty_list_report.
DATA foobar TYPE ty_list_report-hide_column.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 7, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("ABAP_BOOL");
  });

  it("Hover, nested type, qualified name", () => {
    const abap = `TYPES: BEGIN OF zlist,
    BEGIN OF zlist1,
      foo TYPE i,
    END OF zlist1,
  END OF zlist.
DATA bar TYPE zlist-zlist1.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 5, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("zlist-zlist1");
  });

  it("Hover, nested type, qualified name, class", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES:
      BEGIN OF nsimple,
        BEGIN OF list1,
          element TYPE string,
        END OF list1,
      END OF nsimple.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.
START-OF-SELECTION.
  DATA foo TYPE lcl=>nsimple-list1.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 12, 9));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("lcl=>nsimple-list1");
  });

  it("Hover, special MODIFY", () => {
    const abap = `DATA foo TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA row LIKE LINE OF foo.
MODIFY foo FROM row.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 2, 8));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Identifier");
  });

  it("Hover, TYPES from ddic", () => {
    const abap = `INTERFACE lif_test_types.
  TYPES foobar TYPE abap_encod.
ENDINTERFACE.`;

    const dtel = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ABAP_ENCOD</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>20</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DDTEXT>ABAP_ENCOD</DDTEXT>
    <REPTEXT>ABAP_ENCOD</REPTEXT>
    <SCRTEXT_S>ABAP_ENCOD</SCRTEXT_S>
    <SCRTEXT_M>ABAP_ENCOD</SCRTEXT_M>
    <SCRTEXT_L>ABAP_ENCOD</SCRTEXT_L>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000020</LENG>
    <OUTPUTLEN>000020</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const file1 = new MemoryFile("zprog.prog.abap", abap);
    const file2 = new MemoryFile("abap_encod.dtel.xml", dtel);
    const reg = new Registry().addFiles([file1, file2]).parse();
    const hover = new Hover(reg).find(buildPosition(file1, 1, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Qualified Type Name: ```lif_test_types=>foobar```");
    expect(hover?.value).to.contain("DDIC Name: ```ABAP_ENCOD```");
  });

  it("Hover, prefer STRING over generic type when inferred", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo.
    METHODS bar IMPORTING text TYPE clike.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA sdf TYPE abap_bool.
    bar( text = SWITCH #( sdf WHEN abap_true THEN |display| ELSE |edit| ) ).
  ENDMETHOD.
  METHOD bar.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("zprog.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 8, 23));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Identifier");
    expect(hover?.value).to.contain("STRING");
  });

  it("Hover ref type", () => {
    const abap = `CLASS lcl_bar DEFINITION.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.
DATA bar TYPE REF TO lcl_bar.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 4, 6));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("RTTI Name");
  });

  it("Hover constant concatenated value1", () => {
    const abap = `CONSTANTS cval TYPE string VALUE 'a' & 'b'.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("'ab'");
  });

  it("Hover constant concatenated value2", () => {
    const abap = "CONSTANTS cval TYPE string VALUE `a` & `b`.";
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("`ab`");
  });

  it("Hover ddic table, TABLES, variable definition and ddic reference", () => {
    const abap = `TABLES ztab.`;
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file, tabl]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 8));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("DDIC:");
  });

  it("Hover ABAP Doc", () => {
    const abap = `"! hello
DATA foo TYPE c.`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 5));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("ABAP Doc");
  });

});