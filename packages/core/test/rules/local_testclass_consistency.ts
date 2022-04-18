import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {LocalTestclassConsistency} from "../../src/rules";
import {Issue} from "../../src/issue";
import {IFile} from "../../src/files/_ifile";

async function findIssues(files: IFile[]): Promise<readonly Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  const rule = new LocalTestclassConsistency();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: local_testclass_consistency", () => {

  it("parser error, no issues expected", async () => {
    const file = new MemoryFile("zfoo.prog.abap", "hello world.");
    const issues = await findIssues([file]);
    expect(issues.length).to.equal(0);
  });

  it("missing X in xml", async () => {
    const xml = new MemoryFile("zcl_abapgit_testing_test.clas.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_ABAPGIT_TESTING_TEST</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>test test</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
    <WITH_UNIT_TESTS>nope, not set</WITH_UNIT_TESTS>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`);
    const testclass = new MemoryFile("zcl_abapgit_testing_test.clas.testclasses.abap", `* if it exists, check XML`);
    const main = new MemoryFile("zcl_abapgit_testing_test.clas.abap", `class ZCL_ABAPGIT_TESTING_TEST definition
    public
    final
    create public .
  public section.
  protected section.
  private section.
    methods FOOBAR .
  ENDCLASS.
  CLASS ZCL_ABAPGIT_TESTING_TEST IMPLEMENTATION.
    method FOOBAR.
    endmethod.
  ENDCLASS.`);
    const issues = await findIssues([xml, testclass, main]);
    expect(issues.length).to.equal(1);
  });

});
