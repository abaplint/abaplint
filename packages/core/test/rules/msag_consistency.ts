import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {MSAGConsistency} from "../../src/rules";
import {expect} from "chai";

describe("Message rule", () => {
  it("Empty Message class", () => {
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

    const reg = new Registry();
    reg.addFile(new MemoryFile("zagtest_empty.msag.xml", xml)).parse();
    const issues = new MSAGConsistency().initialize(reg).run(reg.getObjects()[0]);
    expect(issues.length).to.equal(0);
  });

  it("Parser error", () => {
    const xml = `sdfsdfsd`;
    const reg = new Registry();
    reg.addFile(new MemoryFile("zagtest_empty.msag.xml", xml)).parse();
    const issues = new MSAGConsistency().initialize(reg).run(reg.getObjects()[0]);
    expect(issues.length).to.equal(0);
  });

});