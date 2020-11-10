import {expect} from "chai";
import {IntfReferencingClas} from "../../src/rules";
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
    issues = issues.concat(new IntfReferencingClas().initialize(reg).run(obj));
  }
  return issues;
}

describe("Rules, intf_referencing_clas", () => {
  it("parser error", async () => {
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents: "parase error"}]);
    expect(issues.length).to.equals(0);
  });

  it("normal class, ok", async () => {
    const contents =
    `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
     ENDCLASS.
     CLASS zcl_foobar IMPLEMENTATION.
     ENDCLASS.`;
    const issues = await runMulti([{filename: "zcl_foo.clas.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("intf referencing clas, error expected", async () => {
    const intf =
      `INTERFACE zif_bar PUBLIC.
        TYPES: ty_bar type standard table of ref to zcl_foo with default key.
      ENDINTERFACE.`;
    const clas =
      `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foo IMPLEMENTATION.
      ENDCLASS.`;
    const issues = await runMulti([
      {filename: "zcl_foo.clas.abap", contents: clas},
      {filename: "zif_bar.intf.abap", contents: intf}]);
    expect(issues.length).to.equals(1);
  });

});