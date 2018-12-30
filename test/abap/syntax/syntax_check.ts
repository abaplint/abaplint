import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {SyntaxCheck} from "../../../src/abap/syntax/syntax_check";

describe("Syntax Check", () => {
  it("parser error", () => {
    const file = new MemoryFile("zcl_foobar.clas.abap", "asdf sdfs");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });

  it("program, variable foobar not found", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "WRITE foobar.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "DATA foobar.\nWRITE foobar.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });

  it("program, foobar found, typed", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "DATA foobar TYPE c LENGTH 1.\nWRITE foobar.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });

  it("program, variable foobar not found, target", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "foobar = 2.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found, target", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "DATA foobar.\nfoobar = 2.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });

  it("program, different scope", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "FORM foobar1.\n" +
      "  DATA moo.\n" +
      "ENDFORM.\n" +
      "FORM foobar2.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"moo\" not found");
  });

  it("program, global scope", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "DATA moo.\n" +
      "FORM foo.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });
/*
  it("program, FORM parameter", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "FORM foo USING boo.\n" +
      "WRITE boo.\n" +
      "ENDFORM.\n");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });
*/
  it("class, simple, no errors", () => {
    const file = new MemoryFile("zcl_foobar.clas.abap", "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });

  it("class, variable foobar not found", () => {
    const file = new MemoryFile(
      "zcl_foobar.clas.abap",
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("class, foobar, local variable", () => {
    const file = new MemoryFile(
      "zcl_foobar.clas.abap",
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    DATA foobar.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.");
    const reg = new Registry().addFile(file).parse();
    const issues = new SyntaxCheck().run(reg);
    expect(issues.length).to.equals(0);
  });

// todo, test both Source and Target

// class variable
// local variable
// method parameter

// upper case vs lower case

});