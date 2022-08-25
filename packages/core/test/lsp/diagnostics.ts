import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Diagnostics} from "../../src/lsp/diagnostics";
import {MemoryFile} from "../../src/files/memory_file";
import {Config} from "../../src";

describe("LSP, diagnostics", () => {

  it("find issues for file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().addFile(file).parse();
    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(2);
  });

  it("find issues for unknown file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().parse();
    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(0);
  });

  it("trigger skip logic, generated gateway class", () => {
    const file = new MemoryFile("zcl_fiori_moni_mpc.clas.abap", `
class ZCL_FIORI_MONI_MPC definition public inheriting from /IWBEP/CL_MGW_PUSH_ABS_MODEL create public.
  PUBLIC SECTION.
    METHODS moo.
ENDCLASS.
CLASS ZCL_FIORI_MONI_MPC IMPLEMENTATION.
  method moo.
    DATA bar type i.
    ADD 2 to bar.
  endmethod.
endclass.`);
    const registry = new Registry().addFile(file);
    const config = registry.getConfig().get();
    config.global.skipGeneratedGatewayClasses = true;
    registry.setConfig(new Config(JSON.stringify(config)));

    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(0);
  });

  it("Unknown object type, multi files", () => {
    const file1 = new MemoryFile("LICENSE", "moo");
    const file2 = new MemoryFile("src/zprog.prog.abap", "REPORT zprog.");
    const registry = new Registry().addFile(file1).addFile(file2);

    expect(new Diagnostics(registry).find({uri: file2.getFilename()}).length).to.equal(0);
  });

  it("two files, same object", () => {
    const file1 = new MemoryFile("zcl_foobar.clas.testclasses.abap", "something_testclass");
    const file2 = new MemoryFile("zcl_foobar.clas.abap", "boo");
    const registry = new Registry().addFile(file1).addFile(file2);

    const issues = new Diagnostics(registry).find({uri: file2.getFilename()});
    for (const i of issues) {
      expect(i.message).to.not.contain("something_testclass");
    }
  });

});