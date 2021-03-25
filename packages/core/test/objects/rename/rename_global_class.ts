import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename Global Class", () => {

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_FOO</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Description</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("CLAS, simple example, just one abap file", () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zcl_foo.clas.abap", abap),
      new MemoryFile("zcl_foo.clas.xml", xml),
    ]).parse();

    new Renamer(reg).rename("CLAS", "zcl_foo", "cl_foo");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "cl_foo.clas.abap") {
        const expected = `CLASS cl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS cl_foo IMPLEMENTATION.
ENDCLASS.`;
        expect(f.getRaw()).to.equal(expected);
      } else if (f.getFilename() === "cl_foo.clas.xml") {
        expect(f.getRaw().includes("<CLSNAME>CL_FOO</CLSNAME>")).to.equal(true);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("CLAS, with usage in PROG", () => {
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
ENDCLASS.`;
    const prog = `DATA foo TYPE REF TO zcl_foo.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zcl_foo.clas.abap", clas),
      new MemoryFile("zfoo.prog.abap", prog),
    ]).parse();

    new Renamer(reg).rename("CLAS", "zcl_foo", "cl_foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "cl_foo.clas.abap") {
        const expected = `CLASS cl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS cl_foo IMPLEMENTATION.
ENDCLASS.`;
        expect(f.getRaw()).to.equal(expected);
      } else if (f.getFilename() === "zfoo.prog.abap") {
        expect(f.getRaw()).to.equal(`DATA foo TYPE REF TO cl_foo.`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("Two classes, static method call", () => {
    const clas1 = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS bar.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const clas2 = `CLASS zcl_bar DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS bar.
ENDCLASS.
CLASS ZCL_bar IMPLEMENTATION.
  METHOD bar.
    zcl_foo=>bar( ).
  ENDMETHOD.
ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zcl_foo.clas.abap", clas1),
      new MemoryFile("zcl_bar.clas.abap", clas2),
    ]).parse();

    new Renamer(reg).rename("CLAS", "zcl_foo", "cl_foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "cl_foo.clas.abap") {
        continue;
      } else if (f.getFilename() === "zcl_bar.clas.abap") {
        expect(f.getRaw()).to.include("cl_foo=>bar( ).");
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it.only("CLAS, inferred type", () => {
    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
ENDCLASS.`;
    const prog = `DATA foo TYPE REF TO zcl_foo.
foo = NEW #( ).`;

    const reg = new Registry().addFiles([
      new MemoryFile("zcl_foo.clas.abap", clas),
      new MemoryFile("zfoo.prog.abap", prog),
    ]).parse();

    new Renamer(reg).rename("CLAS", "zcl_foo", "cl_foo");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "cl_foo.clas.abap") {
        const expected = `CLASS cl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS cl_foo IMPLEMENTATION.
ENDCLASS.`;
        expect(f.getRaw()).to.equal(expected);
      } else if (f.getFilename() === "zfoo.prog.abap") {
        expect(f.getRaw()).to.equal(`DATA foo TYPE REF TO cl_foo.\nfoo = NEW #( ).`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

});