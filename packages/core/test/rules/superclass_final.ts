import {expect} from "chai";
import {SuperclassFinal} from "../../src/rules";
import {Registry} from "../../src/registry";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";

async function runMulti(files: {filename: string, contents: string}[]): Promise<Issue[]> {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  await reg.parseAsync();
  let issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    issues = issues.concat(new SuperclassFinal().initialize(reg).run(obj));
  }
  return issues;
}

describe("Rules, superclass final rule", () => {
  it("parser error", async () => {
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("normal class", async () => {
    const contents =
      `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("superclass final", async () => {
    const clas =
      `CLASS zcl_foobar DEFINITION PUBLIC
        INHERITING FROM zcl_super FINAL CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const sup =
      `CLASS zcl_super DEFINITION PUBLIC FINAL CREATE PUBLIC.
      ENDCLASS.
      CLASS ZCL_SUPER IMPLEMENTATION.
      ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_super.clas.abap", contents: sup}]);
    expect(issues.length).to.equals(1);
  });

  it("superclass not final", async () => {
    const clas =
      `CLASS zcl_foobar DEFINITION PUBLIC
        INHERITING FROM zcl_super FINAL CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const sup =
      `CLASS zcl_super DEFINITION PUBLIC CREATE PUBLIC.
      ENDCLASS.
      CLASS ZCL_SUPER IMPLEMENTATION.
      ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_super.clas.abap", contents: sup}]);
    expect(issues.length).to.equals(0);
  });

  it("superclass, local test classes inheriting", async () => {
    const clas =
      `CLASS zcl_foobar DEFINITION PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const testclasses = `
CLASS ltcl_test_base DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT ABSTRACT.
ENDCLASS.
CLASS ltcl_test_base IMPLEMENTATION.
ENDCLASS.
CLASS ltcl_single_file DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT INHERITING FROM ltcl_test_base.
ENDCLASS.
CLASS ltcl_single_file IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_foobar.clas.testclasses.abap", contents: testclasses}]);
    expect(issues.length).to.equals(0);
  });

  it("superclass, local test classes inheriting 2", async () => {
    const clas =
      `CLASS zcl_foobar DEFINITION PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;
    const testclasses = `
CLASS ltcl_single_file DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT INHERITING FROM lcl_base.
ENDCLASS.
CLASS ltcl_single_file IMPLEMENTATION.
ENDCLASS.`;
    const locals_def = `CLASS lcl_base DEFINITION.
ENDCLASS.`;
    const locals_imp = `CLASS lcl_base IMPLEMENTATION.
ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_foobar.clas.locals_def.abap", contents: locals_def},
      {filename: "zcl_foobar.clas.locals_imp.abap", contents: locals_imp},
      {filename: "zcl_foobar.clas.testclasses.abap", contents: testclasses}]);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});