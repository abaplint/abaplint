import {expect} from "chai";
import {SuperclassFinal} from "../../../src/rules";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files";
import {Issue} from "../../../src/issue";

function runMulti(files: {filename: string, contents: string}[]): Issue[] {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  reg.parse();
  let issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    issues = issues.concat(new SuperclassFinal().run(obj, reg));
  }
  return issues;
}

describe("Rules, superclass final rule", function () {
  it("parser error", () => {
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("normal class", () => {
    const contents = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("superclass final", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.\n";
    const sup =
      "CLASS zcl_super DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_super.clas.abap", contents: sup}]);
    expect(issues.length).to.equals(1);
  });

  it("superclass not final", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.\n";
    const sup =
      "CLASS zcl_super DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", contents: clas},
      {filename: "zcl_super.clas.abap", contents: sup}]);
    expect(issues.length).to.equals(0);
  });

});