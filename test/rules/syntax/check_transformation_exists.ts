import {expect} from "chai";
import {CheckTransformationExists} from "../../../src/rules";
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
    issues = issues.concat(new CheckTransformationExists().run(obj, reg));
  }
  return issues;
}

describe("Rules, check_transformation_exists", function () {
  it("parser error", () => {
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("not found", () => {
    const contents = "REPORT zfoo.\n" +
      "CALL TRANSFORMATION id\n" +
      "  SOURCE (lt_stab)\n" +
      "  RESULT XML li_doc.";
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("dynamic, no error", () => {
    const contents = "REPORT zfoo.\n" +
      "CALL TRANSFORMATION (fsd)\n" +
      "  SOURCE (lt_stab)\n" +
      "  RESULT XML li_doc.";
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("found, ok", () => {
    const contents = "REPORT zfoo.\n" +
      "CALL TRANSFORMATION id\n" +
      "  SOURCE (lt_stab)\n" +
      "  RESULT XML li_doc.";
    const issues = runMulti([
      {filename: "zfoo.prog.abap", contents},
      {filename: "id.xslt.xml", contents: "<foo></foo>"}]);
    expect(issues.length).to.equals(0);
  });

});