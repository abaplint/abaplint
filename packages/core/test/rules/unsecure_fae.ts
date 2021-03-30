import {expect} from "chai";
import {UnsecureFAE} from "../../src/rules/unsecure_fae";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";

async function run(abap: string){
  const reg = new Registry().addFile(new MemoryFile("zunsecure_fae.prog.abap", abap));
  await reg.parseAsync();

  const issues = new UnsecureFAE().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: unsecure_fae", () => {

  it("no error1", async () => {
    const abap = `parser error`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("no error2", async () => {
    const abap = `WRITE hello.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("basic", async () => {
    const abap = `
  DATA lt_list TYPE STANDARD TABLE OF table WITH EMPTY KEY.
  SELECT * FROM table INTO TABLE @DATA(bar)
    FOR ALL ENTRIES IN @lt_list
    WHERE field = @lt_list-field.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

});
