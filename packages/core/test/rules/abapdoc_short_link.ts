import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {AbapdocShortLink} from "../../src/rules";
import {applyEditSingle} from "../../src/edit_helper";

function intf(abapdoc: string): string {
  return `INTERFACE zif_foo PUBLIC.
  "! ${abapdoc}
  DATA foo TYPE string.
  DATA bar TYPE string.
ENDINTERFACE.`;
}

function findIssues(filename: string, abap: string): {reg: Registry, issues: readonly Issue[]} {
  const reg = new Registry();
  reg.addFile(new MemoryFile(filename, abap)).parse();
  const issues = new AbapdocShortLink().initialize(reg).run(reg.getFirstObject()!);
  return {reg, issues};
}

describe("Rule: abapdoc_short_link", () => {

  const tests: {abapdoc: string, cnt: number}[] = [
    {abapdoc: `Same as {@link zif_foo.data:bar}`, cnt: 1},
    {abapdoc: `Same as {@link ZIF_FOO.DATA:BAR}`, cnt: 1},
    {abapdoc: `Same as {@link intf:zif_foo.data:bar}`, cnt: 1},
    {abapdoc: `{@link zif_foo.data:bar} and {@link zif_foo.data:foo}`, cnt: 2},
    {abapdoc: `Same as {@link .data:bar}`, cnt: 0},
    {abapdoc: `Same as {@link zif_other.data:bar}`, cnt: 0},
    {abapdoc: `Same as {@link zif_foo_bar.data:bar}`, cnt: 0},
    {abapdoc: `Same as {@link clas:zif_foo.data:bar}`, cnt: 0},
    {abapdoc: `See {@link zif_foo}`, cnt: 0},
    {abapdoc: `Same as zif_foo.data:bar`, cnt: 0},
  ];

  for (const test of tests) {
    it(`"${test.abapdoc}" should have ${test.cnt} issue(s)`, () => {
      const {issues} = findIssues("zif_foo.intf.abap", intf(test.abapdoc));
      expect(issues.length).to.equal(test.cnt);
    });
  }

  it("regular comment", () => {
    const abap = `INTERFACE zif_foo PUBLIC.
  " Same as {@link zif_foo.data:bar}
  DATA foo TYPE string.
ENDINTERFACE.`;
    expect(findIssues("zif_foo.intf.abap", abap).issues.length).to.equal(0);
  });

  it("namespaced interface", () => {
    const abap = `INTERFACE /foo/if_bar PUBLIC.
  "! Same as {@link /foo/if_bar.data:bar}
  DATA foo TYPE string.
  DATA bar TYPE string.
ENDINTERFACE.`;
    expect(findIssues("#foo#if_bar.intf.abap", abap).issues.length).to.equal(1);
  });

  it("global class", () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! Calls {@link zcl_foo.meth:bar} and {@link clas:zcl_foo.meth:bar}
    METHODS foo.
    METHODS bar.
ENDCLASS.
CLASS zcl_foo IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    expect(findIssues("zcl_foo.clas.abap", abap).issues.length).to.equal(2);
  });

  it("local class in global class, not reported", () => {
    const abap = `CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    "! Calls {@link zcl_foo.meth:bar}
    METHODS foo.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;
    expect(findIssues("zcl_foo.clas.locals_imp.abap", abap).issues.length).to.equal(0);
  });

  it("program, not reported", () => {
    const abap = `INTERFACE zfoo.
  "! Same as {@link zfoo.data:bar}
  DATA bar TYPE string.
ENDINTERFACE.`;
    expect(findIssues("zfoo.prog.abap", abap).issues.length).to.equal(0);
  });

  it("position and quick fix", () => {
    const {reg, issues} = findIssues("zif_foo.intf.abap", intf(`Same as {@link intf:zif_foo.data:bar}`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(2);
    expect(issues[0].getStart().getCol()).to.equal(21);
    expect(issues[0].getEnd().getCol()).to.equal(33);

    applyEditSingle(reg, issues[0].getDefaultFix()!);
    reg.parse();
    expect(reg.getFirstObject()!.getFiles()[0].getRaw()).to.equal(intf(`Same as {@link .data:bar}`));
    const after = new AbapdocShortLink().initialize(reg).run(reg.getFirstObject()!);
    expect(after.length).to.equal(0);
  });

});
