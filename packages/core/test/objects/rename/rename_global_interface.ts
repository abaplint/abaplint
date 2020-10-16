import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename Global Interface", () => {

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_INTF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOINTERF>
    <CLSNAME>ZIF_ABAPGIT_AUTH</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Authorizations</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("INTF", () => {
    const abap = `INTERFACE zif_abapgit_auth PUBLIC.
ENDINTERFACE.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zif_abapgit_auth.intf.abap", abap),
      new MemoryFile("zif_abapgit_auth.intf.xml", xml),
    ]).parse();

    new Renamer(reg).rename("INTF", "zif_abapgit_auth", "if_abapgit_auth");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "if_abapgit_auth.intf.abap") {
        const expected = `INTERFACE if_abapgit_auth PUBLIC.
ENDINTERFACE.`;
        expect(f.getRaw()).to.equal(expected);
      } else if (f.getFilename() === "if_abapgit_auth.intf.xml") {
        expect(f.getRaw().includes("<CLSNAME>IF_ABAPGIT_AUTH</CLSNAME>")).to.equal(true);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("INTF with CLAS implementation", () => {
    const intf = `INTERFACE zif_abapgit_auth PUBLIC.
  METHODS is_allowed.
ENDINTERFACE.`;

    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
PUBLIC SECTION.
  INTERFACES zif_abapgit_auth.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
  METHOD zif_abapgit_auth~is_allowed.
    zif_abapgit_auth~is_allowed( ). zif_abapgit_auth~is_allowed( ).
  ENDMETHOD.
ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zif_abapgit_auth.intf.abap", intf),
      new MemoryFile("zcl_abapgit_auth.clas.abap", clas),
    ]).parse();

    new Renamer(reg).rename("INTF", "zif_abapgit_auth", "if_abapgit_auth");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "if_abapgit_auth.intf.abap") {
        continue;
      } else if (f.getFilename() === "zcl_abapgit_auth.clas.abap") {
        const expected = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
PUBLIC SECTION.
  INTERFACES if_abapgit_auth.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
  METHOD if_abapgit_auth~is_allowed.
    if_abapgit_auth~is_allowed( ). if_abapgit_auth~is_allowed( ).
  ENDMETHOD.
ENDCLASS.`;
        expect(f.getRaw()).to.equal(expected);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("INTF, reference via DEFAULT", () => {
    const intf = `INTERFACE zif_abapgit_auth PUBLIC.
  CONSTANTS bar TYPE i VALUE 2.
ENDINTERFACE.`;

    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
PUBLIC SECTION.
  METHODS bar
    IMPORTING foo TYPE i DEFAULT zif_abapgit_auth=>bar.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zif_abapgit_auth.intf.abap", intf),
      new MemoryFile("zcl_foo.clas.abap", clas),
    ]).parse();

    new Renamer(reg).rename("INTF", "zif_abapgit_auth", "if_abapgit_auth");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "if_abapgit_auth.intf.abap") {
        continue;
      } else if (f.getFilename() === "zcl_foo.clas.abap") {
        expect(f.getRaw()).to.include("DEFAULT if_abapgit_auth=>");
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("INTF, reference via RAISE EVENT", () => {
    const intf = `INTERFACE zif_event PUBLIC.
  EVENTS bar.
ENDINTERFACE.`;

    const clas = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_event.
    METHODS foo.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
  METHOD foo.
    RAISE EVENT zif_event~bar.
  ENDMETHOD.
ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zif_event.intf.abap", intf),
      new MemoryFile("zcl_foo.clas.abap", clas),
    ]).parse();

    new Renamer(reg).rename("INTF", "zif_event", "if_event");

    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "if_event.intf.abap") {
        continue;
      } else if (f.getFilename() === "zcl_foo.clas.abap") {
        expect(f.getRaw()).to.include("RAISE EVENT if_event~bar.");
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

});