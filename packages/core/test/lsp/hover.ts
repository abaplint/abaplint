import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Hover} from "../../src/lsp/hover";
import {IFile} from "../../src/files/_ifile";
import {ITextDocumentPositionParams} from "../../src/lsp/_interfaces";

function buildPosition(file: IFile, row: number, column: number): ITextDocumentPositionParams {
  return {
    textDocument: {uri: file.getFilename()},
    position: LServer.Position.create(row, column),
  };
}

describe("LSP, hover", () => {

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

});