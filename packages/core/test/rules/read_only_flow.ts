import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {ReadOnlyFlow} from "../../src/rules/_read_only_flow";

function chain(length: number, reverse: boolean, recursive = false): string {
  const methods = Array.from({length}, (_, i) => i);
  const declarations = methods.map(i => `CLASS-METHODS step${i}
    IMPORTING pointer TYPE REF TO lcl_owner=>ty_items
    RETURNING VALUE(result) TYPE REF TO lcl_owner=>ty_items.`).join("\n");
  const implementations = (reverse ? methods.reverse() : methods).map(i => `METHOD step${i}.
    ${i === length - 1 ? `${recursive ? "IF sy-subrc = 1. result = step0( pointer ). ENDIF." : ""}
    result = pointer.` : `result = step${i + 1}( pointer ).`}
  ENDMETHOD.`).join("\n");
  return `CLASS lcl_owner DEFINITION.
    PUBLIC SECTION.
      TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
      DATA items TYPE ty_items READ-ONLY.
  ENDCLASS.
  CLASS lcl_owner IMPLEMENTATION. ENDCLASS.
  CLASS lcl_user DEFINITION.
    PUBLIC SECTION.
      CLASS-METHODS run.
      ${declarations}
  ENDCLASS.
  CLASS lcl_user IMPLEMENTATION.
    METHOD run.
      DATA owner TYPE REF TO lcl_owner.
      DATA(pointer) = REF #( owner->items ).
      DATA(alias) = step0( pointer ).
      SORT alias->*.
    ENDMETHOD.
    ${implementations}
  ENDCLASS.`;
}

function analyze(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zread_only_flow.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  const syntax = new SyntaxLogic(reg, obj).run();
  expect(syntax.issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  const flow = new ReadOnlyFlow(obj, syntax.spaghetti);
  const measured = flow as unknown as {analyze: (procedure: unknown) => unknown};
  const original = measured.analyze.bind(flow);
  let analyses = 0;
  measured.analyze = procedure => {
    analyses++;
    return original(procedure);
  };
  const findings = flow.run().map(f => ({token: f.token.getStr(), origins: f.origins, possible: f.possible}));
  return {findings, analyses};
}

describe("READ-ONLY flow summary scheduling", () => {
  for (const length of [16, 64]) {
    it(`propagates a ${length}-method chain in either declaration order with linear analysis work`, () => {
      const forward = analyze(chain(length, false));
      const reverse = analyze(chain(length, true));
      expect(forward.findings).to.deep.equal([{token: "alias", origins: ["items"], possible: false}]);
      expect(reverse.findings).to.deep.equal(forward.findings);
      expect(forward.analyses).to.be.at.most(4 * (length + 2));
      expect(reverse.analyses).to.be.at.most(4 * (length + 2));
    });
  }

  for (const length of [1, 2]) {
    it(`converges for ${length === 1 ? "self" : "mutual"} recursion in either declaration order`, () => {
      const forward = analyze(chain(length, false, true));
      const reverse = analyze(chain(length, true, true));
      expect(forward.findings).to.deep.equal([{token: "alias", origins: ["items"], possible: false}]);
      expect(reverse.findings).to.deep.equal(forward.findings);
      expect(forward.analyses).to.be.at.most(6 * (length + 2));
      expect(reverse.analyses).to.be.at.most(6 * (length + 2));
    });
  }
});
