import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {IReference, ReferenceType} from "../../../src/abap/5_syntax/_reference";
import {getABAPObjects} from "../../get_abap";
import {MemoryFile} from "../../../src/files/memory_file";

function runProgram(abap: string): IReference[] {
  const file = new MemoryFile("zwhen_type.prog.abap", abap);
  const reg = new Registry().addFile(file).parse();
  const obj = getABAPObjects(reg)[0];
  const result = new SyntaxLogic(reg, obj).run();

  expect(result.issues.length).to.equal(0);

  const refs: IReference[] = [];
  const visit = (node: ReturnType<typeof result.spaghetti.getTop>): void => {
    refs.push(...node.getData().references);
    for (const child of node.getChildren()) {
      visit(child);
    }
  };

  visit(result.spaghetti.getTop());
  return refs;
}

describe("WHEN TYPE syntax", () => {
  it("adds object oriented reference for known class", () => {
    const abap = `
CLASS lcl DEFINITION.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  DATA lo_object TYPE REF TO object.
  CASE TYPE OF lo_object.
    WHEN TYPE lcl INTO DATA(target).
  ENDCASE.`;

    const refs = runProgram(abap);
    const found = refs.filter(r => r.referenceType === ReferenceType.ObjectOrientedReference
      && r.position.getName().toUpperCase() === "LCL");

    expect(found.length).to.equal(1);
    expect(found[0].resolved?.getName().toUpperCase()).to.equal("LCL");
  });

  it("adds object oriented void reference for unknown class", () => {
    const abap = `
START-OF-SELECTION.
  DATA lo_object TYPE REF TO object.
  CASE TYPE OF lo_object.
    WHEN TYPE cl_unknown INTO DATA(target).
  ENDCASE.`;

    const refs = runProgram(abap);
    const found = refs.filter(r => r.referenceType === ReferenceType.ObjectOrientedVoidReference
      && r.position.getName().toUpperCase() === "CL_UNKNOWN");

    expect(found.length).to.equal(1);
    expect(found[0].extra?.ooName).to.equal("CL_UNKNOWN");
  });
});
