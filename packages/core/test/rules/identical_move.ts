import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {IdenticalMove} from "../../src/rules";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zidentical_move.prog.abap", abap));
  await reg.parseAsync();
  const rule = new IdenticalMove();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: identical_move", () => {

  it("test 1", async () => {
    const abap = `
data foo type i.
foo = 5.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("test 2", async () => {
    const abap = `
data foo type i.
foo = foo.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("test 2", async () => {
    const abap = `
REPORT zfoo.
 WRITE 'Hello World'.

DATA moo TYPE i VALUE 2.
WRITE moo.
moo = moo.

LOOP AT lt_foo ASSIGNING FIELD-SYMBOL(<ls_foo>).
  WRITE 'bar'.
ENDLOOP.

FORM foo.
  DATA boo TYPE i.
ENDFORM.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});
