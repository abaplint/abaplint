import {Registry} from "../src/registry";
import {MemoryFile} from "../src/files";
import {expect} from "chai";

describe("Registry", () => {

  it("Parse ABAP file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "IF moo = boo. ENDIF.");
    const abap = new Registry().addFile(file).parse().getABAPFiles();
    expect(abap.length).to.equal(1);
    expect(abap[0].getStatements().length).to.equal(2);
    expect(abap[0].getStructure()).to.not.equal(undefined);
  });

  it("Add and update file",  () => {
    const first = new MemoryFile("zfoobar.prog.abap", "first");
    const registry = new Registry().addFile(first);
    expect(registry.getABAPFiles().length).to.equal(1);
    expect(registry.getObjects().length).to.equal(1);

    const updated = new MemoryFile("zfoobar.prog.abap", "updated");
    registry.updateFile(updated);
    expect(registry.getABAPFiles().length).to.equal(1);
    expect(registry.getObjects().length).to.equal(1);

    expect(registry.getABAPFiles()[0].getRaw()).to.equal("updated");
  });

  it("filename with namespace", () => {
    const reg = new Registry().addFile(new MemoryFile("#namesp#cl_foobar.clas.abap", "parser error"));
    expect(reg.getObjects().length).to.equal(1);
    expect(reg.getObjects()[0].getType()).to.equal("CLAS");
    expect(reg.getObject("CLAS", "/namesp/cl_foobar")).to.not.equal(undefined);
  });

  it("filename with namespace, url encoded", () => {
    const reg = new Registry().addFile(new MemoryFile("%23namesp%23cl_foobar.clas.abap", "parser error"));
    expect(reg.getObjects().length).to.equal(1);
    expect(reg.getObjects()[0].getType()).to.equal("CLAS");
    expect(reg.getObject("CLAS", "/namesp/cl_foobar")).to.not.equal(undefined);
  });

  it("Update unknown file, 1", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "IF moo = boo. ENDIF.");
    const registry = new Registry();
    expect(() => { registry.updateFile(file); }).to.throw("find: object not found");
  });

  it("Update unknown file, 2", () => {
    const file = new MemoryFile("zfoobar.clas.abap", "WRITE hello.");
    const registry = new Registry().addFile(file);
    const update = new MemoryFile("zfoobar.clas.testclasses.abap", "WRITE hello..");
    expect(() => { registry.updateFile(update); }).to.throw("updateFile: file not found");
  });

  it("Remove files", () => {
    const file1 = new MemoryFile("zfoobar.clas.abap", "WRITE hello.");
    const file2 = new MemoryFile("zfoobar.clas.testclasses.abap", "WRITE hello..");
    const registry = new Registry().addFiles([file1, file2]);

    expect(registry.getABAPObjects().length).to.equal(1);
    expect(registry.getABAPObjects()[0].getFiles().length).to.equal(2);

    registry.removeFile(file1);
    expect(registry.getABAPObjects().length).to.equal(1);
    expect(registry.getABAPObjects()[0].getFiles().length).to.equal(1);
    expect(registry.getABAPObjects()[0].getFiles()[0].getFilename()).to.equal("zfoobar.clas.testclasses.abap");

    registry.removeFile(file2);
    expect(registry.getABAPObjects().length).to.equal(0);

    expect(() => { registry.removeFile(file1); }).to.throw();
  });

  it("Add and update", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "REPORT zfoobar.\nDATA hello.\nWRITE hello.");
    const registry = new Registry().addFile(file);
    expect(registry.findIssues().length).to.equal(0);

    const updated = new MemoryFile("zfoobar.prog.abap", "moo boo");
    registry.updateFile(updated);
    expect(registry.findIssues().length).to.equal(1);
  });

  it("Double parse should give the same issues, structure", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "IF foo = bar.");
    const registry = new Registry().addFile(file);
    expect(registry.findIssues().length).to.equal(1);
    expect(registry.findIssues().length).to.equal(1);
  });

  it("Double parse should give the same issues, parser errror", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "moo boo");
    const registry = new Registry().addFile(file);
    expect(registry.findIssues().length).to.equal(1);
    expect(registry.findIssues().length).to.equal(1);
  });

  it("Double parse should give the same issues, rule", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().addFile(file);
    const expected = 2;
    expect(registry.findIssues().length).to.equal(expected);
    expect(registry.findIssues().length).to.equal(expected);
  });

  it("find issues for file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().addFile(file);
    expect(registry.findIssuesFile(file).length).to.equal(2);
  });

  it("find issues for unknown file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry();
    expect(registry.findIssuesFile(file).length).to.equal(0);
  });

});