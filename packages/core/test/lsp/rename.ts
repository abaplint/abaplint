import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Rename} from "../../src/lsp/rename";
import {ApplyWorkSpaceEdit} from "./_apply_edit";
import * as LServer from "vscode-languageserver-types";
import {Class} from "../../src/objects";

describe("LSP, prepare rename, global class", () => {

  it("bad position", async () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const rename = new Rename(reg);

    const result = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(1, 1)});
    expect(result).to.equal(undefined);
  });

  it("class definition name", async () => {
    const file = new MemoryFile(
      "zcl_foobar.clas.abap",
      `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();

    const rename = new Rename(reg);

    const bad = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(0, 2)});
    expect(bad).to.equal(undefined);

    const result = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(0, 10)});
    expect(result).to.not.equal(undefined);
    expect(result!.placeholder).to.equal("zcl_foobar");
  });

});

describe("LSP, actual rename, global class", () => {

  it("bad position", async () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const rename = new Rename(reg);

    const result = rename.rename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(1, 1),
      newName: "foobar"});
    expect(result).to.equal(undefined);
  });

  it("name too long", async () => {
    const abap = new MemoryFile(
      "zcl_foobar.clas.abap",
      `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`);
    const reg = new Registry().addFile(abap);
    await reg.parseAsync();
    const rename = new Rename(reg);

    const result = rename.rename({
      textDocument: {uri: abap.getFilename()},
      position: LServer.Position.create(0, 10),
      newName: "foobar_foobar_foobar_foobar_foobar_foobar_foobar_foobar_foobar"});
    expect(result).to.equal(undefined);
  });

  it("rename global class, normal naming", async () => {
    const abap = new MemoryFile(
      "zcl_foobar.clas.abap",
      `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`);

    const xml = new MemoryFile(
      "zcl_foobar.clas.xml",
      `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_FOOBAR</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Description</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`);

    const reg = new Registry().addFile(abap).addFile(xml);
    await reg.parseAsync();
    expect(reg.findIssues().length).to.equal(0);

    const newName = "zcl_new";

    const result = new Rename(reg).rename({
      textDocument: {uri: abap.getFilename()},
      position: LServer.Position.create(0, 10),
      newName: newName});
    expect(result).to.not.equal(undefined);

    new ApplyWorkSpaceEdit(reg).apply(result!);
    expect(reg.getObjects().length).to.equal(1);
    const obj = reg.getObjects()[0] as Class;
    expect(obj.getType()).to.equal("CLAS");

    expect(obj.getName()).to.equal(newName.toUpperCase());
    expect(obj.getMainABAPFile()!.getFilename()).to.equal(newName.toLowerCase() + ".clas.abap");

    const issues = reg.findIssues();
    expect(issues.length).to.equal(0);
  });

  it("rename global class, add namespace", async () => {
    const abap = new MemoryFile(
      "zcl_foobar.clas.abap",
      `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`);

    const xml = new MemoryFile(
      "zcl_foobar.clas.xml",
      `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_FOOBAR</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Description</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`);

    const reg = new Registry();
    reg.addFile(abap);
    reg.addFile(xml);
    reg.parse();
    expect(reg.findIssues().length).to.equal(0);

    const newName = "/foo/cl_bar";

    const result = new Rename(reg).rename({
      textDocument: {uri: abap.getFilename()},
      position: LServer.Position.create(0, 10),
      newName: newName});
    expect(result).to.not.equal(undefined);

    new ApplyWorkSpaceEdit(reg).apply(result!);

    expect(reg.getObjects().length).to.equal(1);
    expect(reg.getObjects()[0]).to.be.instanceof(Class);
    const clas = reg.getObjects()[0] as Class;
    expect(clas.getName()).to.equal("/FOO/CL_BAR");

    const issues = reg.findIssues();
    expect(issues.length).to.equal(1); // gives error regarding class name
    expect(issues[0].getKey()).to.equal("object_naming");
  });

});