import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {Class} from "../../../src/objects";
import {getABAPObjects} from "../../get_abap";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {IRegistry} from "../../../src/_iregistry";
import {MemoryFile} from "../../../src/files/memory_file";
import {StructureType} from "../../../src/abap/types/basic";

function run(reg: IRegistry) {
  const clas = getABAPObjects(reg)[0] as Class;
  const s = new SyntaxLogic(reg, clas).run().spaghetti;
  const scope = s.getTop().getFirstChild()?.getFirstChild();
  return scope;
}

describe("Types, TYPES", () => {
  it.skip("TYPES structure should sometimes inherit qualified name", () => {
    const abap = `INTERFACE lif.
  TYPES bool TYPE c LENGTH 1.
ENDINTERFACE.
TYPES: BEGIN OF t_data,
         field1 TYPE lif=>bool,
         field2 TYPE c LENGTH 3,
       END OF t_data.
DATA ls_data TYPE t_data.`;

    const reg = new Registry().addFile(new MemoryFile("foo.prog.abap", abap)).parse();
    const scope = run(reg);
    expect(scope).to.not.equal(undefined);
    const data = scope!.findVariable("ls_data");
    expect(data).to.not.equal(undefined);
    const type = data?.getType() as StructureType | undefined;
    expect(type).to.not.equal(undefined);

    expect(type?.getComponentByName("FIELD1")?.getQualifiedName()).to.contain("BOOL");
    expect(type?.getComponentByName("FIELD2")?.getQualifiedName()).to.contain("FIELD2");
  });
});