import {expect} from "chai";
import {CheckTransformationExists} from "../../src/rules";
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
    issues = issues.concat(new CheckTransformationExists().initialize(reg).run(obj));
  }
  return issues;
}

describe("Rules, check_transformation_exists", () => {
  it("parser error", async () => {
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("not in error namespace, ok", async () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION id
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = await runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("not found", async () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION zid
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = await runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("dynamic, no error", async () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION (fsd)
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = await runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("found, ok", async () => {
    const contents = `REPORT zfoo.
      CALL TRANSFORMATION id
        SOURCE (lt_stab)
        RESULT XML li_doc.`;
    const issues = await runMulti([
      {filename: "zfoo.prog.abap", contents},
      {filename: "id.xslt.xml", contents: "<foo></foo>"}]);
    expect(issues.length).to.equals(0);
  });

});