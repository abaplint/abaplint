import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src";
import {FindGlobalDefinitions} from "../../src/abap/5_syntax/global_definitions/find_global_definitions";
import {Interface} from "../../src/objects";


describe("FindGlobalDefinitions", () => {

  it("Count untyped constants from interface", async () => {
    const abap = `
INTERFACE if_gobal PUBLIC.
  CONSTANTS field TYPE if_other=>id VALUE '1234'.
ENDINTERFACE.`;

    const files = [new MemoryFile("if_gobal.intf.abap", abap)];

    const reg = await new Registry().addFiles(files).parseAsync();
    const obj = reg.getFirstObject();

    const found = new FindGlobalDefinitions(reg).countUntyped(obj as Interface);
    expect(found).to.equal(1);
  });

});