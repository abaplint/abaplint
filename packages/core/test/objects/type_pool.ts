import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {TypePool} from "../../src/objects";

describe("Type pool", () => {

  it("parse description", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TYPE" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DDTEXT>hello world</DDTEXT>
  </asx:values>
 </asx:abap>
</abapGit>
`;
    const reg = new Registry().addFile(new MemoryFile("zhell.type.xml", xml));
    await reg.parseAsync();
    const type = reg.getFirstObject()! as TypePool;
    expect(type.getDescription()).to.equal("hello world");
  });

});