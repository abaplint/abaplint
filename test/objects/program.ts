import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Program} from "../../src/objects";

describe("Program, isInclude", () => {
  it("no", () => {
    const abap = "WRITE hello.";
    const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));

    const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_PROG\" serializer_version=\"v1.0.0\">\n" +
      "<asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "<asx:values>\n" +
      "<PROGDIR>\n" +
      " <NAME>ZFOOBAR</NAME>\n" +
      " <DBAPL>S</DBAPL>\n" +
      " <SUBC>1</SUBC>\n" +
      " <FIXPT>X</FIXPT>\n" +
      " <LDBNAME>D$S</LDBNAME>\n" +
      " <UCCHECK>X</UCCHECK>\n" +
      "</PROGDIR>\n" +
      "</asx:values>\n" +
      "</asx:abap>\n" +
      "</abapGit>";
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));

    reg.parse();
    const prog = reg.getABAPObjects()[0] as Program;
    expect(prog.isInclude()).to.equal(false);
  });

  it("yes", () => {
    const abap = "WRITE hello.";
    const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));

    const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_PROG\" serializer_version=\"v1.0.0\">\n" +
      "<asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "<asx:values>\n" +
      "<PROGDIR>\n" +
      "  <NAME>ZABAPGIT_PASSWORD_DIALOG</NAME>\n" +
      "  <SUBC>I</SUBC>\n" +
      "  <RLOAD>E</RLOAD>\n" +
      "  <UCCHECK>X</UCCHECK>\n" +
      "</PROGDIR>\n" +
      "</asx:values>\n" +
      "</asx:abap>\n" +
      "</abapGit>";
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));

    reg.parse();
    const prog = reg.getABAPObjects()[0] as Program;
    expect(prog.isInclude()).to.equal(true);
  });

  it("no xml, assume not include", () => {
    const abap = "WRITE hello.";
    const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));

    reg.parse();
    const prog = reg.getABAPObjects()[0] as Program;
    expect(prog.isInclude()).to.equal(false);
  });
});