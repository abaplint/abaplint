import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {MSAGConsistency} from "../../src/rules";
import {expect} from "chai";
import {Issue} from "../../src/issue";

async function run(file: MemoryFile): Promise<Issue[]> {
  const reg = new Registry();
  reg.addFile(file);
  await reg.parseAsync();
  return new MSAGConsistency().initialize(reg).run(reg.getFirstObject()!);
}

describe("Message rule", () => {
  it("Empty Message class", async () => {
    const xml =
`<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZAGTEST_EMPTY</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>empty message class</STEXT>
   </T100A>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const issues = await run(new MemoryFile("zagtest_empty.msag.xml", xml));
    expect(issues.length).to.equal(0);
  });

  it("Parser error", async () => {
    const xml = `sdfsdfsd`;

    const issues = await run(new MemoryFile("zagtest_empty.msag.xml", xml));
    expect(issues.length).to.equal(0);
  });

});