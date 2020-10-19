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
    expect(hover!.value).to.contain("Type definition");
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
    expect(hover?.value).to.contain("Type definition");
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

    const abap = `DATA foo TYPE zddic.`;
    const dtel = new MemoryFile("zddic.dtel.xml", xml);
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const reg = new Registry().addFiles([file, dtel]).parse();
    const hoverVariable = new Hover(reg).find(buildPosition(file, 0, 6));
    expect(hoverVariable).to.not.equal(undefined);
    expect(hoverVariable?.value).to.contain("ZDDIC");
    const hoverDDIC = new Hover(reg).find(buildPosition(file, 0, 15));
    expect(hoverDDIC).to.not.equal(undefined);
    expect(hoverDDIC?.value).to.contain("ddic");
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
    expect(hoverVariable?.value).to.contain("ZTAB");
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
    expect(hover1?.value).to.contain("Reference", "hover1");
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
    expect(hover1?.value).to.contain("Reference", "hover1");
    expect(hover1?.value).to.contain("zcl_test", "hover1");

    const hover2 = new Hover(reg).find(buildPosition(file, 8, 10));
    expect(hover2).to.not.equal(undefined);
    expect(hover2?.value).to.contain("Reference", "hover2");
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
    expect(hover1?.value).to.contain("Reference", "hover1");
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
    expect(hover1?.value).to.contain("Reference", "hover1");
    expect(hover1?.value).to.contain("lif_properties", "hover1");
  });

});