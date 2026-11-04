import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function run(body: string, includes: Record<string, string>, declarations = "", ownerBody = "") {
  const reg = new Registry().addFile(new MemoryFile("zread_only_includes.prog.abap", `REPORT zread_only_includes.
CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
    CLASS-METHODS bind.
ENDCLASS.
DATA owner TYPE REF TO lcl_owner.
DATA mutable_items TYPE lcl_owner=>ty_items.
FIELD-SYMBOLS <items> TYPE lcl_owner=>ty_items.
${declarations}
CLASS lcl_owner IMPLEMENTATION. METHOD bind. ${ownerBody} ENDMETHOD. ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  ${body}
FORM protection_marker.
  DATA pointer TYPE REF TO lcl_owner=>ty_items.
  GET REFERENCE OF owner->items INTO pointer.
ENDFORM.`));
  for (const [name, contents] of Object.entries(includes)) {
    reg.addFile(new MemoryFile(`${name}.prog.abap`, contents));
    reg.addFile(new MemoryFile(`${name}.prog.xml`, "<abapGit><asx:abap><asx:values><PROGDIR><SUBC>I</SUBC></PROGDIR></asx:values></asx:abap></abapGit>"));
  }
  reg.parse();
  for (const obj of reg.getObjects()) {
    if (obj instanceof ABAPObject) {
      for (const file of obj.getABAPFiles()) {
        expect(file.getStructure(), file.getFilename()).to.not.equal(undefined);
        expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
      }
    }
  }
  const obj = reg.getObject("PROG", "zread_only_includes")! as ABAPObject;
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, included source", () => {
  it("preserves report event order when an included caller is reanalyzed", () => {
    const issues = run("ASSIGN mutable_items TO <items>. INCLUDE zcall.", {zcall: "lcl_first=>bind( )."}, `
CLASS lcl_later DEFINITION DEFERRED.
CLASS lcl_first DEFINITION FINAL. PUBLIC SECTION. CLASS-METHODS bind. ENDCLASS.
CLASS lcl_later DEFINITION FINAL. PUBLIC SECTION. CLASS-METHODS bind. ENDCLASS.
CLASS lcl_first IMPLEMENTATION.
  METHOD bind. lcl_later=>bind( ). ENDMETHOD.
ENDCLASS.
CLASS lcl_later IMPLEMENTATION.
  METHOD bind. ASSIGN owner->items TO <items>. ENDMETHOD.
ENDCLASS.
END-OF-SELECTION.
  SORT <items>.`);
    expect(issues.map(i => i.getSeverity())).to.deep.equal([Severity.Error]);
  });

  for (const writable of [false, true]) {
    it(`carries an included ${writable ? "writable" : "protected"} binding into the report`, () => {
      const issues = run("INCLUDE zbind. SORT <items>.", {
        zbind: `ASSIGN ${writable ? "mutable_items" : "owner->items"} TO <items>.`,
      });
      expect(issues).to.have.length(writable ? 0 : 1);
      if (!writable) {
        expect(issues[0].getSeverity()).to.equal(Severity.Error);
      }
    });
  }

  it("collects a FORM defined in an include", () => {
    expect(run("PERFORM bind. SORT <items>. INCLUDE zbind.", {
      zbind: "FORM bind. ASSIGN owner->items TO <items>. ENDFORM.",
    })).to.have.length(1);
  });

  it("executes an included method body in its enclosing procedure", () => {
    expect(run("lcl_user=>bind( ). SORT <items>.", {
      zbind: "ASSIGN owner->items TO <items>.",
    }, `CLASS lcl_user DEFINITION FINAL. PUBLIC SECTION. CLASS-METHODS bind. ENDCLASS.
CLASS lcl_user IMPLEMENTATION. METHOD bind. INCLUDE zbind. ENDMETHOD. ENDCLASS.`)).to.have.length(1);
  });

  it("reports the actual included write location", () => {
    const issues = run("ASSIGN owner->items TO <items>. INCLUDE zwrite.", {zwrite: "SORT <items>."});
    expect(issues).to.have.length(1);
    expect(issues[0].getFilename()).to.equal("zwrite.prog.abap");
    expect(issues[0].getStart().getRow()).to.equal(1);
  });

  it("follows nested includes while cutting cyclic back edges", () => {
    expect(run("INCLUDE zouter. SORT <items>.", {
      zouter: "INCLUDE zinner.",
      zinner: "ASSIGN owner->items TO <items>. INCLUDE zouter.",
    })).to.have.length(1);
  });

  it("keeps permission acquisition local to each occurrence of the same include", () => {
    const body = "lcl_owner=>bind( ). SORT <items>. INCLUDE zbind. SORT <items>.";
    const issues = run(body, {zbind: "ASSIGN owner->items TO <items>."}, "", "INCLUDE zbind.");
    expect(issues).to.have.length(1);
    expect(issues[0].getStart().getCol()).to.equal(body.lastIndexOf("<items>") + 3);
  });

  it("keeps STATICS in different procedures independent when their declarations share an include", () => {
    expect(run(`DATA(first) = lcl_user=>first( ). DATA(second) = lcl_user=>second( ).
      second->* = REF #( mutable_items ). first->* = REF #( owner->items ). SORT second->*->*.`, {
      zcache: "STATICS saved TYPE REF TO ty_pointer. IF saved IS INITIAL. CREATE DATA saved. ENDIF. result = saved.",
    }, `TYPES ty_pointer TYPE REF TO lcl_owner=>ty_items.
CLASS lcl_user DEFINITION FINAL. PUBLIC SECTION.
  CLASS-METHODS first RETURNING VALUE(result) TYPE REF TO ty_pointer.
  CLASS-METHODS second RETURNING VALUE(result) TYPE REF TO ty_pointer.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD first. INCLUDE zcache. ENDMETHOD.
  METHOD second. INCLUDE zcache. ENDMETHOD.
ENDCLASS.`)).to.deep.equal([]);
  });

  it("applies constructors invoked from included statements", () => {
    expect(run("INCLUDE zconstruct. SORT pointer->*.", {
      zconstruct: "DATA binder TYPE REF TO lcl_user. CREATE OBJECT binder.",
    }, `DATA pointer TYPE REF TO lcl_owner=>ty_items.
CLASS lcl_user DEFINITION FINAL. PUBLIC SECTION. METHODS constructor. ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD constructor. pointer = REF #( owner->items ). ENDMETHOD.
ENDCLASS.`)).to.have.length(1);
  });
});
