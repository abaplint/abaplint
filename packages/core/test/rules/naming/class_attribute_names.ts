import {MemoryFile} from "../../../src/files/memory_file";
import {Registry} from "../../../src/registry";
import {expect} from "chai";
import {ClassAttributeNames, ClassAttributeNamesConf} from "../../../src/rules/naming/class_attribute_names";

function findIssues(abap: string, config?: ClassAttributeNamesConf) {
  const reg = new Registry().addFile(new MemoryFile("cl_foobar.clas.abap", abap)).parse();
  const rule = new ClassAttributeNames();
  if (config) {
    rule.setConfig(config);
  }
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: class attribute names (general)", () => {

  it("1: parser error", () => {
    const abap = "sdf lksjdf lkj sdf";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});

describe("Rule: class attribute names", () => {
  const anyUpToThreeLetterPrefix = "^[a-zA-Z]{1,3}_.*$";

  it("1: instance attribute without prefix, issue", () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.instance = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    // defaults to "required"
    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("2: instance attribute with prefix, no issue", () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA mv_foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.instance = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(1);

    // defaults to "required"
    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("3: static attribute without prefix, issue", () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-DATA foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.statics = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("4: constant attribute with prefix, no issue", () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CONSTANTS c_foo TYPE i VALUE 1.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.statics = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("5: constant attribute without prefix, issue", () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CONSTANTS foo TYPE i VALUE 1.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.statics = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("6: local class, ignore, no issue", () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CONSTANTS foo TYPE i VALUE 1.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.statics = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("7: local class, not ignored, issue", () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CONSTANTS foo TYPE i VALUE 1.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.statics = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("8: end position", () => {
    const abap = `
              CLASS zcl_foobar DEFINITION PUBLIC.
                PUBLIC SECTION.
                  CLASS-DATA foo TYPE i.
              ENDCLASS.
              CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;

    const config = new ClassAttributeNamesConf();
    config.instance = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issuesFromRequiredPattern = findIssues(abap, config);
    expect(issuesFromRequiredPattern.length).to.equal(1);
    expect(issuesFromRequiredPattern[0].getEnd().getCol()).to.equal(33);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = undefined;
    const issuesFromUndefinedPattern = findIssues(abap, config);
    expect(issuesFromUndefinedPattern.length).to.equal(1);
    expect(issuesFromUndefinedPattern[0].getEnd().getCol()).to.equal(33);
  });

});