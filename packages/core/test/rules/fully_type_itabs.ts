import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {FullyTypeITabs} from "../../src/rules/fully_type_itabs";

async function run(file: MemoryFile, file2?: MemoryFile){
  const reg = new Registry().addFile(file);
  if (file2) {
    reg.addFile(file2);
  }

  await reg.parseAsync();

  const issues = new FullyTypeITabs().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: fully_type_itabs", () => {

  it("no error", async () => {
    const file = new MemoryFile("zidentical_cond.prog.abap", `WRITE hello.`);
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("no error", async () => {
    const abap = `DATA lt_foo TYPE STANDARD TABLE OF ty WITH EMPTY KEY.`;
    const file = new MemoryFile("zidentical_cond.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("specify table type", async () => {
    const abap = `DATA lt_foo TYPE TABLE OF ty.`;
    const file = new MemoryFile("zidentical_cond.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("specify table key", async () => {
    const abap = `DATA lt_bar TYPE STANDARD TABLE OF ty.`;
    const file = new MemoryFile("zidentical_cond.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("DDIC reference", async () => {
    const string_table = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>STRING_TABLE</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>STRG</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>String Table</DDTEXT>
    <TYPELEN>000008</TYPELEN>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const abap = `DATA lt_bar TYPE string_table.`;
    const prog = new MemoryFile("string_tabl.prog.abap", abap);
    const ttyp = new MemoryFile("string_table.ttyp.xml", string_table);
    const issues = await run(prog, ttyp);
    expect(issues.length).to.equal(0);
  });

  it("range", async () => {
    const abap = `DATA lt_bar TYPE RANGE OF i.`;
    const file = new MemoryFile("zrange.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("chained, show correct line", async () => {
    const abap = `
DATA: lt_stream_line TYPE i,
      lt_tline       TYPE TABLE OF i,`;
    const file = new MemoryFile("zrange.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(3);
  });

});
