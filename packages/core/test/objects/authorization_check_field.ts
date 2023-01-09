import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {AuthorizationCheckField} from "../../src/objects";

describe("AUTH, parse XML", () => {
  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_AUTH" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AUTHX>
    <FIELDNAME>YFOO</FIELDNAME>
    <ROLLNAME>YFOO</ROLLNAME>
   </AUTHX>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("yfoo.auth.xml", xml));
    await reg.parseAsync();
    const enqu = reg.getFirstObject()! as AuthorizationCheckField;

    const tab = enqu.getDataElementName();
    expect(tab).to.not.equal(undefined);
    expect(tab).to.equal("YFOO");
  });

});