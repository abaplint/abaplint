import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AddTestAttributes} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new AddTestAttributes();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: add_test_attributes", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues(`CLASS ltcl_test DEFINITION FINAL FOR TESTING.
  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
    METHODS test FOR TESTING RAISING cx_static_check.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues.length).to.equal(2);
  });

  it("fixed", async () => {
    const issues = await findIssues(`CLASS ltcl_test DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
    METHODS test FOR TESTING RAISING cx_static_check.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });


});
