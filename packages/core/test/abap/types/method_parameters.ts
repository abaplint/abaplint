import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {Class} from "../../../src/objects";
import {getABAPObjects} from "../../get_abap";
import {IClassDefinition} from "../../../src/abap/types/_class_definition";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {IRegistry} from "../../../src/_iregistry";
import {MemoryFile} from "../../../src/files/memory_file";

function run(reg: IRegistry): IClassDefinition | undefined {
  const clas = getABAPObjects(reg)[0] as Class;
  const s = new SyntaxLogic(reg, clas).run().spaghetti;
  const scope = s.getTop().getFirstChild();
  return scope?.findClassDefinition(clas.getName());
}

describe("Types, method_parameters", () => {
  it("default importing, with DEFAULT", () => {
    const abap = `CLASS cl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS name
      IMPORTING
        iv_url      TYPE string
        iv_validate TYPE abap_bool DEFAULT abap_false.
ENDCLASS.
CLASS cl IMPLEMENTATION.
  METHOD name.
    WRITE iv_url.
  ENDMETHOD.
ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("cl.clas.abap", abap)).parse();
    const cdef = run(reg);
    expect(cdef).to.not.equal(undefined);
    const def = cdef!.getMethodDefinitions().getByName("name");
    expect(def).to.not.equal(undefined);
    const parameters = def!.getParameters();
    expect(parameters.getDefaultImporting()).to.equal("IV_URL");
    expect(parameters.getParameterDefault("IV_VALIDATE")?.concatTokens()).to.equal("abap_false");
    expect(parameters.getParameterDefault("SDFDSDFS")).to.equal(undefined);
  });
});