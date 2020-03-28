import {MemoryFile} from "../../../src/files/memory_file";
import {Registry} from "../../../src/registry";
import {expect} from "chai";
import {LocalVariableNames, LocalVariableNamesConf} from "../../../src/rules";

function findIssues(abap: string, config?: LocalVariableNamesConf) {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  const rule = new LocalVariableNames();
  if (config) {
    rule.setConfig(config);
  }
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: local variable names (required pattern)", () => {
  const anyUpToThreeLetterPrefix = "^[a-zA-Z]{1,3}_.*$";
  const fsPrefix = "^<[a-zA-Z]{1,3}_.*>$";

  it("parser error", () => {
    const abap = "sdf lksjdf lkj sdf";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("local variable with prefix", () => {
    const abap = `
    FORM foobar.
    DATA lv_moo TYPE i.
    ENDFORM.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;
    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("local variable without prefix, FORM", () => {
    const abap = `
    FORM foobar.
    DATA moo TYPE i.
    ENDFORM.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = undefined;
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("local variable without prefix inside METHOD", () => {
    const abap = `
CLASS foo IMPLEMENTATION.
    METHOD foobar.
      DATA moo TYPE i.
    ENDMETHOD.
ENDCLASS.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("local variable without prefix inside Function Module", () => {
    const abap = `
FUNCTION foo.
  DATA moo TYPE i.
ENDFUNCTION.`;
    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("no prefix, FORM, fieldsymbol", () => {
    const abap = `
FORM foobar.
  FIELD-SYMBOL <moo> TYPE i.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedFS = fsPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("prefix, FORM, fieldsymbol", () => {
    const abap = `
FORM foobar.
  FIELD-SYMBOL <lv_moo> TYPE i.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedFS = fsPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("prefix, FORM, DATA BEGIN OF", () => {
    const abap = `
FORM foobar.
  DATA: BEGIN OF ls_foo,
                 moob TYPE i,
        END OF ls_foo.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("no prefix, FORM, DATA BEGIN OF", () => {
    const abap = `
FORM foobar.
  DATA: BEGIN OF foo,
            moob TYPE i,
        END OF foo.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("no prefix, local constant", () => {
    const abap = `
FORM foobar.
  CONSTANTS foo TYPE c VALUE 'A' LENGTH 1.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedConstant = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(1);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(0);
  });

  it("prefix, local constant", () => {
    const abap = `
FORM foobar.
  CONSTANTS lc_foo TYPE c VALUE 'A' LENGTH 1.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedConstant = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect(findIssues(abap, config).length).to.equal(0);

    config.patternKind = "forbidden";
    expect(findIssues(abap, config).length).to.equal(1);
  });

  it("ok, local constant structure", () => {
    const abap = `
FORM foobar.
  CONSTANTS: BEGIN OF lc_parameter_type,
              import TYPE vepparamtype VALUE 'I',
              export TYPE vepparamtype VALUE 'O',
              END OF lc_parameter_type.
ENDFORM.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);

      // todo prefix - not supported by parser yet (this syntax will never report any issues)
  });

});