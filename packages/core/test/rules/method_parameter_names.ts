import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {MethodParameterNames, MethodParameterNamesConf} from "../../src/rules/method_parameter_names";
import {expect} from "chai";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, filename: string, config?: MethodParameterNamesConf): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new MethodParameterNames();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe(`Rule: method parameter names (general)`, () => {

  it(`no methods, interface`, async () => {
    const abap = `
INTERFACE zif_foobar PUBLIC.
ENDINTERFACE.`;
    const issues = await findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`no methods, class`, async () => {
    const abap = `
CLASS zcl_foobar PUBLIC.
ENDCLASS.`;
    const issues = await findIssues(abap, `zif_foobar.clas.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`parser error, class`, async () => {
    const abap = `sdfsd sdf sdfsd fd`;
    const issues = await findIssues(abap, `zif_foobar.clas.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`parser error, interface`, async () => {
    const abap = `sdfsd sdf sdfsd fd`;
    const issues = await findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(0);
  });

});

describe(`Rule: method parameter names (skipping)`, () => {

  const config = new MethodParameterNamesConf();
  config.ignoreExceptions = true;
  config.ignoreNames = ["P_TASK"];

  it(`skip exception`, async () => {
    const abap = `
CLASS zcx_abapgit_exception DEFINITION
PUBLIC
INHERITING FROM cx_static_check
CREATE PUBLIC.
PUBLIC SECTION.
  METHODS constructor IMPORTING foo TYPE C OPTIONAL.
ENDCLASS.
CLASS zcx_abapgit_exception IMPLEMENTATION.
ENDCLASS.`;

    const issues = await findIssues(abap, `zcx_abapgit_exception.clas.abap`, config);
    expect(issues.length).to.equal(0);
  });

  it(`skip p_task`, async () => {
    const abap = `
  INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING p_task TYPE i.
  ENDINTERFACE.`;
    const issues = await findIssues(abap, `zif_foobar.intf.abap`, config);
    expect(issues.length).to.equal(0);
  });

  // todo this is not configurable
  it(`ignore event handler parameter names`, async () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS on_link_click FOR EVENT link_click OF cl_salv_events_table
  IMPORTING row column.
ENDCLASS.`;
    const issues = await findIssues(abap, `foobar.prog.abap`, config);
    expect(issues.length).to.equal(0);
  });

});

describe(`Rule: method parameter names`, async () => {
  const anyUpToThreeLetterPrefix = "^[a-zA-Z]{1,3}_.*$";
  it(`interface with a method, no prefix on method parameter 1`, async () => {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING foo TYPE i.
ENDINTERFACE.`;

    const config = new MethodParameterNamesConf();
    config.importing = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issues1 = await findIssues(abap, `zif_foobar.intf.abap`, config);
    expect(issues1.length).to.equal(1);

    config.patternKind = "forbidden";
    const issues2 = await findIssues(abap, `zif_foobar.intf.abap`, config);
    expect(issues2.length).to.equal(0);
  });

  it(`interface with a method, prefix on method parameter 1`, async () => {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING !iv_foo TYPE i.
ENDINTERFACE.`;

    const config = new MethodParameterNamesConf();
    config.importing = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issues1 = await findIssues(abap, `zif_foobar.intf.abap`, config);
    expect(issues1.length).to.equal(0);

    config.patternKind = "forbidden";
    const issues2 = await findIssues(abap, `zif_foobar.intf.abap`, config);
    expect(issues2.length).to.equal(1);
  });

  it(`interface with a method, prefix on method parameter 1`, async () => {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING iv_foo TYPE i.
ENDINTERFACE.`;

    const config = new MethodParameterNamesConf();
    config.importing = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issues1 = await findIssues(abap, `zif_foobar.intf.abap`, config);
    expect(issues1.length).to.equal(0);

    config.patternKind = "forbidden";
    const issues2 = await findIssues(abap, `zif_foobar.intf.abap`, config);
    expect(issues2.length).to.equal(1);
  });

  it(`instance method without prefix`, async () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS method1 IMPORTING foo TYPE i.
ENDCLASS.`;

    const config = new MethodParameterNamesConf();
    config.importing = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issues1 = await findIssues(abap, `foobar.prog.abap`, config);
    expect(issues1.length).to.equal(1);

    config.patternKind = "forbidden";
    const issues2 = await findIssues(abap, `foobar.prog.abap`, config);
    expect(issues2.length).to.equal(0);
  });

  it(`static method without prefix`, async () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS method1 IMPORTING foo TYPE i.
ENDCLASS.`;

    const config = new MethodParameterNamesConf();
    config.importing = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issues1 = await findIssues(abap, `foobar.prog.abap`, config);
    expect(issues1.length).to.equal(1);

    config.patternKind = "forbidden";
    const issues2 = await findIssues(abap, `foobar.prog.abap`, config);
    expect(issues2.length).to.equal(0);
  });

  it(`end position`, async () => {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS method1 IMPORTING foo TYPE i.
ENDCLASS.`;
    const config = new MethodParameterNamesConf();
    config.importing = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    const issuesFromRequiredPattern = await findIssues(abap, `foobar.prog.abap`, config);
    expect(issuesFromRequiredPattern.length).to.equal(1);
    expect(issuesFromRequiredPattern[0].getEnd().getCol()).to.equal(40);

    config.patternKind = "forbidden";
    const issues2 = await findIssues(abap, "foobar.prog.abap", config);
    expect(issues2.length).to.equal(0);
  });

});