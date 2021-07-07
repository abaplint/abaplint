import {expect} from "chai";
import {UnsecureFAE} from "../../src/rules/unsecure_fae";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IFile} from "../../src";

async function run(files: IFile[]){
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();

  const issues = new UnsecureFAE().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: unused_ddic", () => {

  it("no error", async () => {
    const files = [new MemoryFile("zunused_ddic.prog.abap", `WRITE 'moo'.`)];
    const issues = await run(files);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it.skip("Unused DOMA", async () => {
    const files = [new MemoryFile(`zunused.doma.xml`, `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD01V>
    <DOMNAME>ZUNUSED</DOMNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
    <OUTPUTLEN>000010</OUTPUTLEN>
    <DDTEXT>Testing</DDTEXT>
   </DD01V>
  </asx:values>
 </asx:abap>
</abapGit>`)];
    const issues = await run(files);
    expect(issues.length).to.equal(1);
  });

});
