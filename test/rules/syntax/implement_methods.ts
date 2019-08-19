import {expect} from "chai";
import {ImplementMethods} from "../../../src/rules";
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
    issues = issues.concat(new ImplementMethods().run(obj, reg));
  }
  return issues;
}

describe("Rules, implement_methods", function () {
  it("parser error", () => {
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("normal class, no methods", () => {
    const contents = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("local class, implementation part not found", () => {
    const contents = "REPORT zrep.\n" +
      "CLASS lcl_foobar DEFINITION.\n" +
      "ENDCLASS.\n";
    const issues = runMulti([{filename: "zrep.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("normal class, missing implementation", () => {
    const contents = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS foobar.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("normal class, method implemented", () => {
    const contents = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS foobar.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("abstract method", () => {
    const contents = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS foobar ABSTRACT.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("abstract method, do not implement", () => {
    const contents = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS foobar ABSTRACT.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("global class with local classes", () => {
    const main = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const imp = "CLASS lcl_foo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const def = "CLASS lcl_foo DEFINITION.\n" +
      "ENDCLASS.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.locals_imp.abap", contents: imp},
      {filename: "zcl_foobar.clas.locals_def.abap", contents: def},
      {filename: "zcl_foobar.clas.abap", contents: main},
    ]);
    expect(issues.length).to.equals(0);
  });

});