import {expect} from "chai";
import {CheckTransformationExists} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {Issue} from "../../src/issue";

function runMulti(files: {filename: string, contents: string}[]): Issue[] {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  reg.parse();
  let issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    issues = issues.concat(new CheckTransformationExists().initialize(reg).run(obj));
  }
  return issues;
}

describe("Rules, check_transformation_exists", () => {
  it("parser error", () => {
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("not found", () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION ztest
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("dynamic, no error", () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION (fsd)
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("found, ok", () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION ztest
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = runMulti([
      {filename: "zfoo.prog.abap", contents},
      {filename: "ztest.xslt.xml", contents: "<foo></foo>"}]);
    expect(issues.length).to.equals(0);
  });

  it("id transformation", () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION id
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

});
