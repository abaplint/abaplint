import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {Interface} from "../../../src/objects";
import {Visibility} from "../../../src/abap/4_file_information/visibility";
import {getABAPObjects} from "../../get_abap";
import {IInterfaceDefinition} from "../../../src/abap/types/_interface_definition";
import {IRegistry} from "../../../src/_iregistry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {MemoryFile} from "../../../src/files/memory_file";

function run(reg: IRegistry): IInterfaceDefinition | undefined {
  const intf = getABAPObjects(reg)[0] as Interface;
  const s = new SyntaxLogic(reg, intf).run().spaghetti;
  const scope = s.getTop().getFirstChild();
  return scope?.findInterfaceDefinition(intf.getName());
}

describe("Types, interface_definition, getMethodDefinitions", () => {
  it("test, positive", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const defs = def!.getMethodDefinitions().getAll();
    expect(defs.length).to.equal(1);
    expect(defs[0].getName()).to.equal("method1");
    expect(defs[0].getVisibility()).to.equal(Visibility.Public);
  });

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", "parser error")).parse();
    const def = run(reg);
    expect(def).to.equal(undefined);
  });
});

describe("Types, interface_definition, getMethodDefinitions", () => {
  it("test, positive", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const def = run(reg);
    const defs = def!.getMethodDefinitions().getAll();
    expect(defs.length).to.equal(1);
    expect(defs[0].getParameters().getImporting().length).to.equal(1);
    expect(defs[0].getParameters().getImporting()[0].getName()).to.equal("foo");
  });

  it("test, returning", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 RETURNING VALUE(rv_foo) TYPE i.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const def = run(reg);
    const defs = def!.getMethodDefinitions().getAll();
    expect(defs.length).to.equal(1);
    const returning = defs[0].getParameters().getReturning();
    expect(returning).to.not.equal(undefined);
    if (returning) {
      expect(returning.getName()).to.equal("rv_foo");
    }
  });
});

describe("Types, interface_definition, getAttributes", () => {
  it("test, positive", () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  DATA moo TYPE i.\n" +
      "ENDINTERFACE.";

    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap)).parse();
    const def = run(reg);
    const instance = def!.getAttributes()!.getInstance();
    expect(instance.length).to.equal(1);
    expect(instance[0].getName()).to.equal("moo");
    expect(instance[0].getVisibility()).to.equal(Visibility.Public);
  });
});