import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ClassAttributeNames, ClassAttributeNamesConf} from "../../src/rules/class_attribute_names";

function findIssues(abap: string, config?: ClassAttributeNamesConf, filename?: string) {
  if (!filename) {
    filename = "cl_foobar.clas.abap";
  }
  const reg = new Registry().addFile(new MemoryFile(filename, abap)).parse();
  const rule = new ClassAttributeNames();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getObjects()[0]);
}

describe("Rule: class attribute names (general)", () => {

  it("1: parser error", () => {
    const abap = "sdf lksjdf lkj sdf";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("2: class data begin of", () => {
    const abap = `
CLASS l_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-DATA: wrong1 TYPE i.
    CLASS-DATA: BEGIN OF gs_german_umlaut_as_char,
      lower_case_ae TYPE string,
      END OF gs_german_umlaut_as_char.
ENDCLASS.
CLASS l_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
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
    config.constants = "^C_.+$";

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
    config.constants = "^C_.+$";

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
    config.constants = "^C_.+$";

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
    config.constants = "^C_.+$";

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("8: local class, not ignored, any naming allowed", () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CONSTANTS foo TYPE i VALUE 1.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.constants = "";

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    // always an error
    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("9: end position", () => {
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

describe("Rule: class attribute names (interfaces)", () => {
  const fileProgram = "zfoobar.prog.abap";
  it("2: local interface member, ignore local", () => {
    const abap = `
INTERFACE lif_foo.
    DATA: foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = true;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.instance = "^M._.+$";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);
  });

  it("3: local interface member, ignore interface", () => {
    const abap = `
INTERFACE lif_foo.
    DATA: foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = true;
    config.patternKind = "required";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);
  });

  it("4: local interface member, prefix not supplied", () => {
    const abap = `
INTERFACE lif_foo.
    DATA: foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.instance = "^M._.+$";
    expect(findIssues(abap, config, fileProgram).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config, fileProgram).length).to.equal(1);
  });

  it("5: local interface member, prefix supplied", () => {
    const abap = `
INTERFACE lif_foo.
    DATA: mv_foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config, fileProgram).length).to.equal(1);

    config.patternKind = undefined;
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);
  });

  it("6: local interface constant, prefix supplied", () => {
    const abap = `
INTERFACE lif_foo.
    CONSTANTS: c_foo TYPE i VALUE 1.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.constants = "C_.+$";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config, fileProgram).length).to.equal(1);

    config.patternKind = undefined;
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);
  });

  it("7: local interface constant, prefix not supplied", () => {
    const abap = `
INTERFACE lif_foo.
    CONSTANTS: foo TYPE i VALUE 1.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.constants = "C_.+$";
    expect(findIssues(abap, config, fileProgram).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config, fileProgram).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config, fileProgram).length).to.equal(1);
  });

  it("8: global interface all variants, mixed", () => {
    const abap = `
REPORT zfoobar.
INTERFACE zif_foo PUBLIC.
  DATA: bar TYPE i.
  CONSTANTS: foo TYPE i VALUE 1.
  CLASS-DATA: gv_foobar TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = true;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.constants = "^C_.+$";

    expect(findIssues(abap, config, fileProgram).length).to.equal(2);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config, fileProgram).length).to.equal(1);

    config.patternKind = undefined;
    expect(findIssues(abap, config, fileProgram).length).to.equal(2);
  });

});