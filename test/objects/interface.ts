import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Interface} from "../../src/objects";
import {Scope} from "../../src/objects/class/scope";

describe("Objects, interface, getMethodDefinitions", () => {
  it("test, positive", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    expect(intf.getMethodDefinitions().length).to.equal(1);
    expect(intf.getMethodDefinitions()[0].getName()).to.equal("method1");
    expect(intf.getMethodDefinitions()[0].getScope()).to.equal(Scope.Public);
  });

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", "parser error")).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    expect(intf.getMethodDefinitions().length).to.equal(0);
  });
});

describe("Objects, interface, getMethodParameters", () => {
  it("test, positive", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    expect(intf.getMethodDefinitions().length).to.equal(1);
    expect(intf.getMethodDefinitions()[0].getParameters().getImporting().length).to.equal(1);
    expect(intf.getMethodDefinitions()[0].getParameters().getImporting()[0].getName()).to.equal("foo");
  });

  it("test, returning", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 RETURNING VALUE(rv_foo) TYPE i.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const intf = reg.getABAPObjects()[0] as Interface;
    expect(intf.getMethodDefinitions().length).to.equal(1);
    expect(intf.getMethodDefinitions()[0].getParameters().getReturning()).to.not.equal(undefined);
    expect(intf.getMethodDefinitions()[0].getParameters().getReturning().getName()).to.equal("rv_foo");
  });
});