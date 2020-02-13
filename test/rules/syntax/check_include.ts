import {expect} from "chai";
import {CheckInclude} from "../../../src/rules";
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
    issues = issues.concat(new CheckInclude().run(obj, reg));
  }
  return issues;
}

describe("Rules, check_include", () => {
  it("parser error", () => {
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents: "parser error"}]);
    expect(issues.length).to.equals(0);
  });

  it("not found", () => {
    const contents = `INCLUDE znot_found.`;
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("found", () => {
    const issues = runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zexists.prog.xml", contents: `<SUBC>I</SUBC>`},
      {filename: "zfoo.prog.abap", contents: `INCLUDE zexists.`}]);
    expect(issues.length).to.equals(0);
  });

  it("error, not possible to INCLUDE main program", () => {
    const issues = runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zfoo.prog.abap", contents: `INCLUDE zexists.`}]);
    expect(issues.length).to.equals(1);
  });

  it("not found, IF FOUND", () => {
    const contents = `INCLUDE znot_found IF FOUND.`;
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("not used", () => {
    const issues = runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zexists.prog.xml", contents: `<SUBC>I</SUBC>`}]);
    expect(issues.length).to.equals(1);
  });

});