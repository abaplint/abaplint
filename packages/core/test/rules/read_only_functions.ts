import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function parameter(name: string, type: string, direction = "IMPORT", reference = true): string {
  const row = direction === "IMPORT" ? "RSIMP" : direction === "EXPORT" ? "RSEXP" : "RSCHA";
  return `<${direction}><${row}><PARAMETER>${name}</PARAMETER>${reference ? "<REFERENCE>X</REFERENCE>" : ""}
<TYP>ZCL_RO_FUNCTION=>${type}</TYP></${row}></${direction}>`;
}

function run(body: string, implementation: string, parameters: string, global = false) {
  const files: Record<string, string> = {
    "zro_alias.fugr.xml": `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"><asx:values>
<AREAT>Readonly aliases</AREAT><FUNCTIONS><item><FUNCNAME>ZRO_ALIAS</FUNCNAME>
${global ? "<GLOBAL_FLAG>X</GLOBAL_FLAG>" : ""}${parameters}
</item></FUNCTIONS></asx:values></asx:abap></abapGit>`,
    "zro_alias.fugr.saplzro_alias.abap": `FUNCTION-POOL zro_alias.
CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO zcl_ro_function.
    DATA mutable_items TYPE zcl_ro_function=>ty_items.
    ${body}
  ENDMETHOD.
ENDCLASS.`,
    "zro_alias.fugr.zro_alias.abap": `FUNCTION zro_alias.
  ${implementation}
ENDFUNCTION.`,
    "zcl_ro_function.clas.abap": `CLASS zcl_ro_function DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    TYPES ty_pointer TYPE REF TO ty_items.
    DATA items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS zcl_ro_function IMPLEMENTATION.
ENDCLASS.`,
  };
  const reg = new Registry();
  for (const [filename, contents] of Object.entries(files)) {
    reg.addFile(new MemoryFile(filename, contents));
  }
  reg.parse();
  const rule = new ReadOnlyWrite().initialize(reg);
  return [...reg.getObjects()].flatMap(obj => {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }
    for (const file of obj.getABAPFiles()) {
      expect(file.getStructure(), file.getFilename()).to.not.equal(undefined);
      expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
    }
    expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
    return rule.run(obj);
  });
}

describe("Rule: read_only_write, function modules", () => {
  const prefix = `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).`;

  for (const global of [false, true]) {
    const suffix = global ? " with GLOBAL_FLAG" : "";
    it("follows a singleton reference import parameter" + suffix, () => {
      const issues = run(prefix + "CALL FUNCTION 'ZRO_ALIAS' EXPORTING ip = pointer.",
                         "SORT ip->*.", parameter("IP", "TY_POINTER"), global);
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Error);
    });

    it("follows a singleton table CHANGING parameter" + suffix, () => {
      expect(run(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    CALL FUNCTION 'ZRO_ALIAS' CHANGING items = <items>.`, "SORT items.",
                 parameter("ITEMS", "TY_ITEMS", "CHANGING"), global)).to.have.length(1);
    });

    it("preserves a reference returned through an output parameter" + suffix, () => {
      expect(run(prefix + `DATA other TYPE REF TO zcl_ro_function=>ty_items.
    CALL FUNCTION 'ZRO_ALIAS' EXPORTING ip = pointer IMPORTING ep = other.
    SORT other->*.`, "ep = ip.", parameter("IP", "TY_POINTER") + parameter("EP", "TY_POINTER", "EXPORT"),
                 global)).to.have.length(1);
    });
  }

  it("matches parameters from a multi-row import XML table", () => {
    const parameters = `<IMPORT>
<RSIMP><PARAMETER>IP</PARAMETER><REFERENCE>X</REFERENCE><TYP>ZCL_RO_FUNCTION=>TY_POINTER</TYP></RSIMP>
<RSIMP><PARAMETER>IP2</PARAMETER><REFERENCE>X</REFERENCE><TYP>ZCL_RO_FUNCTION=>TY_POINTER</TYP></RSIMP>
</IMPORT>`;
    expect(run(prefix + `DATA(other) = REF #( mutable_items ).
    CALL FUNCTION 'ZRO_ALIAS' EXPORTING ip = pointer ip2 = other.`, "SORT ip->*.", parameters)).to.have.length(1);
  });

  it("allows the same function to mutate a writable reference", () => {
    expect(run(`DATA(pointer) = REF #( mutable_items ).
    CALL FUNCTION 'ZRO_ALIAS' EXPORTING ip = pointer.`, "SORT ip->*.", parameter("IP", "TY_POINTER"))).to.deep.equal([]);
  });

  it("allows modification of an independent table value parameter", () => {
    expect(run(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    CALL FUNCTION 'ZRO_ALIAS' EXPORTING items = <items>.`, "SORT items.",
               parameter("ITEMS", "TY_ITEMS", "IMPORT", false))).to.deep.equal([]);
  });

  it("initializes a function module VALUE export before copying it back", () => {
    expect(run(prefix + `CALL FUNCTION 'ZRO_ALIAS' IMPORTING ep = pointer.
    SORT pointer->*.`, "", parameter("EP", "TY_POINTER", "EXPORT", false))).to.deep.equal([]);
  });

  it("retains an unchanged function module reference export", () => {
    const issues = run(prefix + `CALL FUNCTION 'ZRO_ALIAS' IMPORTING ep = pointer.
    SORT pointer->*.`, "", parameter("EP", "TY_POINTER", "EXPORT"));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });
});
