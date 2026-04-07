import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename Program", () => {

  it("PROG, no references, just the object", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZPROG</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const abap = `REPORT zprog.
WRITE 'Hello'.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zprog.prog.xml", xml),
      new MemoryFile("zprog.prog.abap", abap),
    ]).parse();

    new Renamer(reg).rename("PROG", "zprog", "zfoo");

    expect(reg.getObjectCount().normal).to.equal(1);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "zfoo.prog.abap") {
        expect(f.getRaw()).to.equal("REPORT zfoo.\nWRITE 'Hello'.");
      } else if (f.getFilename() === "zfoo.prog.xml") {
        expect(f.getRaw().includes("<NAME>ZFOO</NAME>")).to.equal(true);
      } else {
        expect(1).to.equal(f.getFilename(), "Unexpected file");
      }
    }
  });

  it("PROG, includes", () => {
    const xmlProg1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZPROG1</NAME>
    <SUBC>1</SUBC>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const abapProg1 = `REPORT zprog1.
INCLUDE zincl.`;

    const xmlIncl = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZINCL</NAME>
    <SUBC>I</SUBC>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const abapIncl = `WRITE 'Hello'.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zprog1.prog.xml", xmlProg1),
      new MemoryFile("zprog1.prog.abap", abapProg1),
      new MemoryFile("zincl.prog.xml", xmlIncl),
      new MemoryFile("zincl.prog.abap", abapIncl),
    ]).parse();

    new Renamer(reg).rename("PROG", "zincl", "zfoo");

    for (const f of reg.getFiles()) {
      if (f.getFilename() === "zfoo.prog.abap") {
        expect(f.getRaw()).to.equal("WRITE 'Hello'.");
      } else if (f.getFilename() === "zfoo.prog.xml") {
        expect(f.getRaw().includes("<NAME>ZFOO</NAME>")).to.equal(true);
      } else if (f.getFilename() === "zprog1.prog.abap") {
        expect(f.getRaw().includes("INCLUDE zfoo.")).to.equal(true);
      }
    }
  });

});
