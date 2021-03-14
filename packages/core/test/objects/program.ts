import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Program} from "../../src/objects";
import {getABAPObjects} from "../get_abap";

describe("Program, isInclude", () => {
  it("no", async () => {
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

    await reg.parseAsync();
    const prog = getABAPObjects(reg)[0] as Program;
    expect(prog.isInclude()).to.equal(false);
  });

  it("yes", async () => {
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

    await reg.parseAsync();
    const prog = getABAPObjects(reg)[0] as Program;
    expect(prog.isInclude()).to.equal(true);
  });

  it("no xml, assume not include", async () => {
    const abap = "WRITE hello.";
    const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));

    await reg.parseAsync();
    const prog = getABAPObjects(reg)[0] as Program;
    expect(prog.isInclude()).to.equal(false);
  });

  it("read textpool", async () => {
    const abap = "WRITE hello.";
    const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOOBAR</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>hello world 1</ENTRY>
     <LENGTH>22</LENGTH>
    </item>
    <item>
     <ID>I</ID>
     <KEY>ABC</KEY>
     <ENTRY>hello world 2</ENTRY>
     <LENGTH>22</LENGTH>
    </item>
    <item>
     <ID>R</ID>
     <ENTRY>Program ZFOOBAR</ENTRY>
     <LENGTH>28</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;
    reg.addFile(new MemoryFile("zfoobar.prog.xml", xml));

    await reg.parseAsync();
    const prog = getABAPObjects(reg)[0] as Program;
    const texts = prog.getTexts();
    expect(Object.keys(texts).length).to.equal(2);
    expect(texts["001"]).to.equal("hello world 1");
    expect(texts["ABC"]).to.equal("hello world 2");
    expect(texts["bar"]).to.equal(undefined);
  });

});