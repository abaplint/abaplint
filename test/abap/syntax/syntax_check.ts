import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {CheckVariables} from "../../../src/abap/syntax/check_variables";
import {Issue} from "../../../src/issue";

function runClass(abap: string): Issue[] {
  const file = new MemoryFile("zcl_foobar.clas.abap", abap);
  const reg = new Registry().addFile(file).parse();
  return new CheckVariables().run(reg.getABAPFiles()[0]);
}

function runProgram(abap: string): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg = new Registry().addFile(file).parse();
  return new CheckVariables().run(reg.getABAPFiles()[0]);
}

describe("Syntax Check", () => {
  it("parser error", () => {
    const issues = runClass("asdf sdfs");
    expect(issues.length).to.equals(0);
  });

  it("program, variable foobar not found", () => {
    const abap = "WRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found", () => {
    const abap = "DATA foobar.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, foobar found, typed", () => {
    const abap = "DATA foobar TYPE c LENGTH 1.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, variable foobar not found, target", () => {
    const abap = "foobar = 2.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found, target", () => {
    const abap = "DATA foobar.\nfoobar = 2.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, different scope", () => {
    const abap = "FORM foobar1.\n" +
      "  DATA moo.\n" +
      "ENDFORM.\n" +
      "FORM foobar2.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"moo\" not found");
  });

  it("program, global scope", () => {
    const abap = "DATA moo.\n" +
      "FORM foo.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });
/*
  it("program, FORM parameter", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "FORM foo USING boo.\n" +
      "WRITE boo.\n" +
      "ENDFORM.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = runProgram();
    expect(issues.length).to.equals(0);
  });
*/
  it("class, simple, no errors", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, variable foobar not found", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("class, foobar, local variable", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    DATA foobar.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

// todo, test both Source and Target

// class variable
// local variable
// method parameter

// upper case vs lower case

});