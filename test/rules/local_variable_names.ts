import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {LocalVariableNames} from "../../src/rules";

function findIssues(abap: string) {
  let reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  let rule = new LocalVariableNames();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: local variable names", function() {
  it("parser error", function () {
    const abap = "sdf lksjdf lkj sdf";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", function () {
    const abap = "FORM foobar. DATA lv_moo TYPE i. ENDFORM.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue, FORM", function () {
    const abap = "FORM foobar. DATA moo TYPE i. ENDFORM.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("issue, METHOD", function () {
    const abap = "CLASS foo IMPLEMENTATION. METHOD foobar. DATA moo TYPE i. ENDMETHOD. ENDCLASS.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("issue, Function Module", function () {
    const abap = "FUNCTION foo. DATA moo TYPE i. ENDFUNCTION.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("issue, FORM, fieldsymbol", function () {
    const abap = "FORM foobar. FIELD-SYMBOL <moo> TYPE i. ENDFORM.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("ok, FORM, fieldsymbol", function () {
    const abap = "FORM foobar. FIELD-SYMBOL <lv_moo> TYPE i. ENDFORM.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, FORM, DATA BEGIN OF", function () {
    const abap = "FORM foobar. DATA: BEGIN OF ls_foo, moob TYPE i, END OF ls_foo. ENDFORM.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue, FORM, DATA BEGIN OF", function () {
    const abap = "FORM foobar. DATA: BEGIN OF foo, moob TYPE i, END OF foo. ENDFORM.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });
});