import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Interface} from "../../src/objects";
import {Scope} from "../../src/abap/types/scope";

// todo, most(all?) of these tests to be moved to abap/types/

describe("Objects, interface, getMethodDefinitions", () => {
  it("test, positive", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    const def = intf.getDefinition();
    expect(def).to.not.equal(undefined);
    expect(def!.getMethodDefinitions().length).to.equal(1);
    expect(def!.getMethodDefinitions()[0].getName()).to.equal("method1");
    expect(def!.getMethodDefinitions()[0].getScope()).to.equal(Scope.Public);
  });

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", "parser error")).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    expect(intf.getDefinition()).to.equal(undefined);
  });
});

describe("Objects, interface, getMethodParameters", () => {
  it("test, positive", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    expect(intf.getDefinition()!.getMethodDefinitions().length).to.equal(1);
    expect(intf.getDefinition()!.getMethodDefinitions()[0].getParameters().getImporting().length).to.equal(1);
    expect(intf.getDefinition()!.getMethodDefinitions()[0].getParameters().getImporting()[0].getName()).to.equal("foo");
  });

  it("test, returning", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 RETURNING VALUE(rv_foo) TYPE i.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    expect(intf.getDefinition()!.getMethodDefinitions().length).to.equal(1);
    const returning = intf.getDefinition()!.getMethodDefinitions()[0].getParameters().getReturning();
    expect(returning).to.not.equal(undefined);
    if (returning) {
      expect(returning.getName()).to.equal("rv_foo");
    }
  });
});