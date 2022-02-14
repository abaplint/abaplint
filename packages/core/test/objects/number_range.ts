import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {NumberRange} from "../../src/objects";

describe("Number range, parse main xml", () => {

  it("parse", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_NROB" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <ATTRIBUTES>
    <OBJECT>ZSNRO</OBJECT>
    <DOMLEN>ZSNRO</DOMLEN>
    <PERCENTAGE>10.0</PERCENTAGE>
   </ATTRIBUTES>
   <TEXT>
    <LANGU>E</LANGU>
    <OBJECT>ZSNRO</OBJECT>
    <TXT>SNRO</TXT>
    <TXTSHORT>SNRO</TXTSHORT>
   </TEXT>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zsnro.nrob.xml", xml));
    await reg.parseAsync();
    const nrob = reg.getFirstObject()! as NumberRange;
    expect(nrob.getDescription()).to.equal("SNRO");
    expect(nrob.getDomain()).to.equal("ZSNRO");
    expect(nrob.getPercentage()).to.equal(10);
  });

});