import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {MIMEObject} from "../../src/objects";

describe("SMIM parse", () => {

  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SMIM" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/SAP/PUBLIC/zag_unit_test.txt</URL>
   <CLASS>M_TEXT_L</CLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("02b8283ec9511ee5b5aaf11a0c28106a.smim.xml", xml));
    await reg.parseAsync();
    const smim = reg.getFirstObject()! as MIMEObject;
    expect(smim).to.not.equal(undefined);
    expect(smim.getURL()).to.equal("/SAP/PUBLIC/zag_unit_test.txt");
    expect(smim.getClass()).to.equal("M_TEXT_L");
  });

});