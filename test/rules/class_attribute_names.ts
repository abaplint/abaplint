import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ClassAttributeNames} from "../../src/rules/class_attribute_names";

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("cl_foobar.clas.abap", abap)).parse();
  const rule = new ClassAttributeNames();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: class attribute names", function() {
  it("parser error", function () {
    const abap = "sdf lksjdf lkj sdf";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue", function () {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC.\n" +
      "  PUBLIC SECTION. DATA foo TYPE i.\n" +
      "ENDCLASS. CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("no issue", function () {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC.\n" +
      "  PUBLIC SECTION. DATA mv_foo TYPE i.\n" +
      "ENDCLASS. CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue", function () {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC.\n" +
      "  PUBLIC SECTION. CLASS-DATA foo TYPE i.\n" +
      "ENDCLASS. CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("end position", function () {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC.\n" +
      "  PUBLIC SECTION. CLASS-DATA foo TYPE i.\n" +
      "ENDCLASS. CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getEnd().getCol()).to.equal(33);
  });

});