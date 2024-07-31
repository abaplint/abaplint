import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {CyclicOO} from "../../src/rules";
import {IFile} from "../../src";

async function runSingle(files: IFile[]): Promise<readonly Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  return new CyclicOO().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: cyclic oo", () => {

  it("test 1", async () => {
    const abap = "parser error";
    const issues = await runSingle([new MemoryFile("zprog.prog.abap", abap)]);
    expect(issues.length).to.equal(0);
  });

  it("test 2", async () => {
    const abap = `
    INTERFACE zbar.
      DATA foo TYPE i.
    ENDINTERFACE.`;
    const issues = await runSingle([new MemoryFile("zbar.intf.abap", abap)]);
    expect(issues.length).to.equal(0);
  });

  it("test 3, cyclic", async () => {
    const zbar = `
    INTERFACE zbar.
      TYPES type1 TYPE i.
      DATA bar TYPE zfoo=>type2.
    ENDINTERFACE.`;
    const zfoo = `
    INTERFACE zfoo.
      TYPES type2 TYPE i.
      DATA foo TYPE zbar=>type1.
    ENDINTERFACE.`;
    const issues = await runSingle([
      new MemoryFile("zbar.intf.abap", zbar),
      new MemoryFile("zfoo.intf.abap", zfoo),
    ]);
    expect(issues.length).to.equal(1);
  });

  it("two separate", async () => {
    const zbar = `
    INTERFACE zbar.
      TYPES type1 TYPE i.
    ENDINTERFACE.`;
    const zfoo = `
    INTERFACE zfoo.
      TYPES type2 TYPE i.
    ENDINTERFACE.`;
    const issues = await runSingle([
      new MemoryFile("zbar.intf.abap", zbar),
      new MemoryFile("zfoo.intf.abap", zfoo),
    ]);
    expect(issues.length).to.equal(0);
  });

  it("via constant value", async () => {
    const zbar = `
interface zif_fetch_destination public.

  types destination_type type string.

  constants:
    begin of destination_types,
      url type destination_type value zif_fetch_destination_url=>type,
    end of destination_types.
endinterface.`;
    const zfoo = `
interface zif_fetch_destination_url public.
  interfaces zif_fetch_destination.

  constants type type zif_fetch_destination~destination_type value 'URL'.
endinterface.`;
    const issues = await runSingle([
      new MemoryFile("zif_fetch_destination_url.intf.abap", zfoo),
      new MemoryFile("zif_fetch_destination.intf.abap", zbar),
    ]);
    expect(issues.length).to.equal(1);
  });

});