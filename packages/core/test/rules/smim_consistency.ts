import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {SMIMConsistency} from "../../src/rules";
import {expect} from "chai";
import {Issue} from "../../src/issue";

async function run(file: MemoryFile): Promise<Issue[]> {
  const reg = new Registry();
  reg.addFile(file);
  await reg.parseAsync();
  return new SMIMConsistency().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule smim_consistency", () => {
  it("folder not found", async () => {
    const xml =
`<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SMIM" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/foobar/server/hello/bundle.js</URL>
   <CLASS>M_TEXT_L</CLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const issues = await run(new MemoryFile("0b9be95a76f11d38e10000000adc9967.smim.xml", xml));
    expect(issues.length).to.equal(1);
  });

  it("top is okay", async () => {
    const xml =
`<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SMIM" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/hello</URL>
   <FOLDER>X</FOLDER>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const issues = await run(new MemoryFile("0b9be95a76f11d38e10000000adc9967.smim.xml", xml));
    expect(issues.length).to.equal(0);
  });

});