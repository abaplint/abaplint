import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ClassAttributeNames, ClassAttributeNamesConf} from "../../src/rules/class_attribute_names";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, config?: ClassAttributeNamesConf, filename?: string): Promise<readonly Issue[]> {
  if (!filename) {
    filename = "cl_foobar.clas.abap";
  }
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new ClassAttributeNames();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getObjects()[0]);
}

describe("Rule: class attribute names (general)", () => {

  it("1: parser error", async () => {
    const abap = "sdf lksjdf lkj sdf";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("2: class data begin of", async () => {
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
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});

describe("Rule: class attribute names", () => {
  const anyUpToThreeLetterPrefix = "^[a-zA-Z]{1,3}_.*$";

  it("1: instance attribute without prefix, issue", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.instance = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);

    // defaults to "required"
    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("2: instance attribute with prefix, no issue", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA mv_foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.instance = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);

    // defaults to "required"
    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("3: static attribute without prefix, issue", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-DATA foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.statics = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("4: constant attribute with prefix, no issue", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CONSTANTS c_foo TYPE i VALUE 1.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.constants = "^C_.+$";

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("5: constant attribute without prefix, issue", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CONSTANTS foo TYPE i VALUE 1.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.constants = "^C_.+$";

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("6: local class, ignore, no issue", async () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CONSTANTS foo TYPE i VALUE 1.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION. ENDCLASS.`;
    const config = new ClassAttributeNamesConf();
    config.constants = "^C_.+$";

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("7: local class, not ignored, issue", async () => {
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
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("8: local class, not ignored, any naming allowed", async () => {
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
    expect((await findIssues(abap, config)).length).to.equal(0);

    // always an error
    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("9: end position", async () => {
    const abap = `
              CLASS zcl_foobar DEFINITION PUBLIC.
                PUBLIC SECTION.
                  CLASS-DATA foo TYPE i.
              ENDCLASS.
              CLASS zcl_foobar IMPLEMENTATION. ENDCLASS.`;

    const config = new ClassAttributeNamesConf();
    config.instance = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issuesFromRequiredPattern = await findIssues(abap, config);
    expect(issuesFromRequiredPattern.length).to.equal(1);
    expect(issuesFromRequiredPattern[0].getEnd().getCol()).to.equal(33);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = undefined;
    const issuesFromUndefinedPattern = await findIssues(abap, config);
    expect(issuesFromUndefinedPattern.length).to.equal(1);
    expect(issuesFromUndefinedPattern[0].getEnd().getCol()).to.equal(33);
  });
});

describe("Rule: class attribute names (interfaces)", () => {
  const fileProgram = "zfoobar.prog.abap";
  it("2: local interface member, ignore local", async () => {
    const abap = `
INTERFACE lif_foo.
    DATA: foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = true;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.instance = "^M._.+$";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);
  });

  it("3: local interface member, ignore interface", async () => {
    const abap = `
INTERFACE lif_foo.
    DATA: foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = true;
    config.patternKind = "required";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);
  });

  it("4: local interface member, prefix not supplied", async () => {
    const abap = `
INTERFACE lif_foo.
    DATA: foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.instance = "^M._.+$";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(1);
  });

  it("5: local interface member, prefix supplied", async () => {
    const abap = `
INTERFACE lif_foo.
    DATA: mv_foo TYPE i.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(1);

    config.patternKind = undefined;
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);
  });

  it("6: local interface constant, prefix supplied", async () => {
    const abap = `
INTERFACE lif_foo.
    CONSTANTS: c_foo TYPE i VALUE 1.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.constants = "C_.+$";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(1);

    config.patternKind = undefined;
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);
  });

  it("7: local interface constant, prefix not supplied", async () => {
    const abap = `
INTERFACE lif_foo.
    CONSTANTS: foo TYPE i VALUE 1.
ENDINTERFACE.`;
    const config = new ClassAttributeNamesConf();
    config.ignoreLocal = false;
    config.ignoreInterfaces = false;
    config.patternKind = "required";
    config.constants = "C_.+$";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(1);
  });

  it("8: global interface all variants, mixed", async () => {
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

    expect((await findIssues(abap, config, fileProgram)).length).to.equal(2);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(1);

    config.patternKind = undefined;
    expect((await findIssues(abap, config, fileProgram)).length).to.equal(2);
  });

});