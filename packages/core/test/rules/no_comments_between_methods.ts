import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {NoCommentsBetweenMethods} from "../../src/rules";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap));
  await reg.parseAsync();
  const rule = new NoCommentsBetweenMethods();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: no_comments_between_methods", () => {

  it("test 1", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS foo.
    METHODS bar.
ENDCLASS.

CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.

  METHOD bar.
  ENDMETHOD.
ENDCLASS.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("test 2", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS foo.
    METHODS bar.
ENDCLASS.

CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
  " this is a comment
  METHOD bar.
  ENDMETHOD.
ENDCLASS.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});
