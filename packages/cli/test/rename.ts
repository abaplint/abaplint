import {expect} from "chai";
import * as memfs from "memfs";
import {Registry, MemoryFile} from "@abaplint/core";
import {Rename} from "../src/rename";

describe("Apply rename", () => {

  it("test 1", async () => {
    const intf = `INTERFACE zif_intf PUBLIC.
  TYPES: BEGIN of ty,
           sdfsdf TYPE i,
         END OF ty.
ENDINTERFACE.`;

    const clas = `CLASS zcl_clas DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS foo IMPORTING field TYPE zif_intf=>ty.
ENDCLASS.
CLASS zcl_clas IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;

    const file1 = new MemoryFile("zif_intf.intf.abap", intf);
    const file2 = new MemoryFile("zcl_clas.clas.abap", clas);
    const reg = new Registry().addFiles([file1, file2]).parse();

    const jsonFiles: any = {};
    jsonFiles[file1.getFilename()] = file1.getRaw();
    jsonFiles[file2.getFilename()] = file2.getRaw();

    const volume = memfs.Volume.fromJSON(jsonFiles);
    const mockFS = memfs.createFsFromVolume(volume);

    const config = reg.getConfig().get();
    config.rename = {"patterns": [{"type": "CLAS|INTF", "oldName": "zif_intf", "newName": "yif_sdfsdf"}]};

    new Rename(reg).run(config, "base", mockFS, true);

    const intfNew = mockFS.readFileSync("yif_sdfsdf.intf.abap").toString();
    expect(intfNew).to.include("INTERFACE yif_sdfsdf");
    const clasNew = mockFS.readFileSync(file2.getFilename()).toString();
    expect(clasNew).to.include("TYPE yif_sdfsdf=>");
  });

  it("only rename with the first match", async () => {
    const intf = `INTERFACE zif_intf PUBLIC.
  TYPES: BEGIN of ty,
           sdfsdf TYPE i,
         END OF ty.
ENDINTERFACE.`;

    const file1 = new MemoryFile("zif_intf.intf.abap", intf);
    const reg = new Registry().addFiles([file1]).parse();

    const jsonFiles: any = {};
    jsonFiles[file1.getFilename()] = file1.getRaw();

    const volume = memfs.Volume.fromJSON(jsonFiles);
    const mockFS = memfs.createFsFromVolume(volume);

    const config = reg.getConfig().get();
    config.rename = {"patterns": [
      {"type": "INTF", "oldName": "zif_intf", "newName": "yif_sdfsdf1"},
      {"type": "INTF", "oldName": "zif_intf", "newName": "yif_sdfsdf2"},
    ]};

    new Rename(reg).run(config, "base", mockFS, true);

    const intfNew = mockFS.readFileSync("yif_sdfsdf1.intf.abap").toString();
    expect(intfNew).to.include("INTERFACE yif_sdfsdf1");
  });

  it("renames class, icf service and handler inside the icf service", async () => {
    const clas = `CLASS zcl_handler DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
ENDCLASS.
CLASS zcl_handler IMPLEMENTATION.
ENDCLASS.`;

    const sicf = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SICF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/sap/example/z_svc/</URL>
   <ICFSERVICE>
    <ICF_NAME>Z_SVC</ICF_NAME>
    <ORIG_NAME>z_svc</ORIG_NAME>
   </ICFSERVICE>
   <ICFHANDLER_TABLE>
    <ICFHANDLER>
     <ICF_NAME>Z_SVC</ICF_NAME>
     <ICFORDER>01</ICFORDER>
     <ICFTYP>A</ICFTYP>
     <ICFHANDLER>ZCL_HANDLER</ICFHANDLER>
    </ICFHANDLER>
   </ICFHANDLER_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const fileClass = new MemoryFile("zcl_handler.clas.abap", clas);
    const fileSicf = new MemoryFile("z_svc 9def6c78d0beedf8d5b04ba6c.sicf.xml", sicf);
    const reg = new Registry().addFiles([fileClass, fileSicf]).parse();

    const jsonFiles: any = {};
    jsonFiles[fileClass.getFilename()] = fileClass.getRaw();
    jsonFiles[fileSicf.getFilename()] = fileSicf.getRaw();

    const volume = memfs.Volume.fromJSON(jsonFiles);
    const mockFS = memfs.createFsFromVolume(volume);

    const config = reg.getConfig().get();
    config.rename = {"patterns": [
      {"type": "CLAS", "oldName": "zcl_handler", "newName": "zcl_handler_new"},
      {"type": "SICF", "oldName": "z_svc", "newName": "z_new"},
    ]};

    new Rename(reg).run(config, "base", mockFS, true);

    // class file renamed and content updated
    const classNew = mockFS.readFileSync("zcl_handler_new.clas.abap").toString();
    expect(classNew).to.include("CLASS zcl_handler_new");

    // sicf file renamed and content updated (ICF_NAME and ICFHANDLER)
    const sicfNew = mockFS.readFileSync("z_new 9def6c78d0beedf8d5b04ba6c.sicf.xml").toString();
    expect(sicfNew).to.include("<URL>/sap/example/z_new/</URL>");
    expect(sicfNew).to.include("<ICF_NAME>Z_NEW</ICF_NAME>");
    expect(sicfNew).to.include("<ORIG_NAME>z_new</ORIG_NAME>");
    expect(sicfNew).to.include("<ICFHANDLER>ZCL_HANDLER_NEW</ICFHANDLER>");
  });

  it("renames interface referenced in DEFAULT value", async () => {
    const intf = `INTERFACE zif_abapgit_definitions PUBLIC.
  TYPES ty TYPE i.
  CONSTANTS c_value TYPE i VALUE 1.
ENDINTERFACE.`;

    const clas = `CLASS zcl_example DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS create
      IMPORTING
        iv_sci_result  TYPE zif_abapgit_definitions=>ty DEFAULT zif_abapgit_definitions=>c_value.
ENDCLASS.
CLASS zcl_example IMPLEMENTATION.
  METHOD create.
  ENDMETHOD.
ENDCLASS.`;

    const file1 = new MemoryFile("zif_abapgit_definitions.intf.abap", intf);
    const file2 = new MemoryFile("zcl_example.clas.abap", clas);
    const reg = new Registry().addFiles([file1, file2]).parse();

    const jsonFiles: any = {};
    jsonFiles[file1.getFilename()] = file1.getRaw();
    jsonFiles[file2.getFilename()] = file2.getRaw();

    const volume = memfs.Volume.fromJSON(jsonFiles);
    const mockFS = memfs.createFsFromVolume(volume);

    const config = reg.getConfig().get();
    config.rename = {"patterns": [{"type": "INTF", "oldName": "zif_abapgit_definitions", "newName": "yif_definitions"}]};

    new Rename(reg).run(config, "base", mockFS, true);

    const intfNew = mockFS.readFileSync("yif_definitions.intf.abap").toString();
    expect(intfNew).to.include("INTERFACE yif_definitions");

    const clasNew = mockFS.readFileSync(file2.getFilename()).toString();
    expect(clasNew).to.include("TYPE yif_definitions=>ty");
    expect(clasNew).to.include("DEFAULT yif_definitions=>c_value");
    expect(clasNew).to.include("CLASS-METHODS create");
  });

  it("renames top interface with method, enclosed interface, and implementing class", async () => {
    const top = `INTERFACE zif_top PUBLIC.
  METHODS do_something.
ENDINTERFACE.`;

    const wrapper = `INTERFACE zif_wrapper PUBLIC.
  INTERFACES zif_top.
ENDINTERFACE.`;

    const sup = `CLASS zcl_super DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_top.
ENDCLASS.

CLASS zcl_super IMPLEMENTATION.
ENDCLASS.`;

    const clas = `CLASS zcl_impl DEFINITION PUBLIC FINAL CREATE PUBLIC INHERITING FROM zcl_super.
  PUBLIC SECTION.
    INTERFACES zif_wrapper.
ENDCLASS.

CLASS zcl_impl IMPLEMENTATION.
  METHOD zif_top~do_something.
    rv_result = iv_value.
  ENDMETHOD.
ENDCLASS.`;

    const file1 = new MemoryFile("zif_top.intf.abap", top);
    const file2 = new MemoryFile("zif_wrapper.intf.abap", wrapper);
    const file3 = new MemoryFile("zcl_impl.clas.abap", clas);
    const file4 = new MemoryFile("zcl_super.clas.abap", sup);
    const reg = new Registry().addFiles([file1, file2, file3, file4]).parse();

    const jsonFiles: any = {};
    jsonFiles[file1.getFilename()] = file1.getRaw();
    jsonFiles[file2.getFilename()] = file2.getRaw();
    jsonFiles[file3.getFilename()] = file3.getRaw();
    jsonFiles[file4.getFilename()] = file4.getRaw();

    const volume = memfs.Volume.fromJSON(jsonFiles);
    const mockFS = memfs.createFsFromVolume(volume);

    const config = reg.getConfig().get();
    config.rename = {"patterns": [{"type": "INTF", "oldName": "zif_top", "newName": "ZIF_AA"}]};

    new Rename(reg).run(config, "base", mockFS, true);

    // class references updated
    const clasNew = mockFS.readFileSync(file3.getFilename()).toString();
    expect(clasNew).to.include("METHOD zif_aa~do_something");
  });

});
