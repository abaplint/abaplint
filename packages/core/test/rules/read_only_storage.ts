import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function run(body: string, report = false) {
  const declarations = `DATA owner TYPE REF TO lcl_owner.
    DATA mutable_items TYPE lcl_owner=>ty_items.
    DATA(unused_guard) = REF #( owner->items ).`;
  const abap = `CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION. ENDCLASS.
${report ? declarations + body : `CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD run.
    ${declarations}
    ${body}
  ENDMETHOD.
ENDCLASS.`}`;
  const reg = new Registry().addFile(new MemoryFile("zread_only_storage.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, declaration and row storage", () => {
  it("REFRESH removes old reference rows before a writable refill", () => {
    expect(run(`DATA rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
      APPEND REF #( owner->items ) TO rows.
      REFRESH rows.
      APPEND REF #( mutable_items ) TO rows.
      READ TABLE rows INDEX 1 INTO DATA(pointer).
      SORT pointer->*.`)).to.deep.equal([]);
  });

  it("REFRESH clears reference components in the table body and preserves its header", () => {
    const issues = run(`TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_row.
      DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY WITH HEADER LINE.
      rows-pointer = REF #( owner->items ).
      APPEND rows TO rows.
      REFRESH rows.
      DATA incoming TYPE ty_row.
      incoming-pointer = REF #( mutable_items ).
      APPEND incoming TO rows.
      READ TABLE rows INDEX 1 INTO DATA(selected).
      SORT selected-pointer->*.
      SORT rows-pointer->*.`, true);
    expect(issues.map(i => i.getSeverity())).to.deep.equal([Severity.Error]);
  });

  it("CLEAR resets only a table's header without discarding its rows", () => {
    for (const target of ["rows", "selected"]) {
      const issues = run(`CREATE OBJECT owner.
      TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_row.
      DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY WITH HEADER LINE.
      rows-pointer = REF #( owner->items ).
      APPEND rows.
      CLEAR rows.
      READ TABLE rows INDEX 1 INTO DATA(selected).
      SORT ${target}-pointer->*.`, true);
      expect(issues.map(i => i.getSeverity())).to.deep.equal(target === "rows" ? [] : [Severity.Error]);
    }
  });

  for (const operation of ["REFRESH", "CLEAR", "FREE"]) {
    it(`${operation} through an uncertain alias retains possibly untouched protected rows`, () => {
      const issues = run(`TYPES ty_rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
      DATA rows TYPE ty_rows. DATA other TYPE ty_rows.
      APPEND REF #( owner->items ) TO rows.
      FIELD-SYMBOLS <rows> TYPE ty_rows.
      IF sy-subrc = 0. ASSIGN rows TO <rows>. ELSE. ASSIGN other TO <rows>. ENDIF.
      ${operation} <rows>.
      APPEND REF #( mutable_items ) TO rows.
      READ TABLE rows INDEX 1 INTO DATA(pointer).
      SORT pointer->*.`);
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Warning);
    });
  }

  for (const writable of [false, true]) {
    it(`retains ${writable ? "writable" : "protected"} structure components when READ TABLE fails`, () => {
      const issues = run(`TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_row.
        DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
        DATA selected TYPE ty_row.
        selected-pointer = REF #( ${writable ? "mutable_items" : "owner->items"} ).
        READ TABLE rows INDEX 1 INTO selected.
        SORT selected-pointer->*.`);
      expect(issues).to.have.length(writable ? 0 : 1);
    });

    for (const structured of [false, true]) {
      const description = `${writable ? "writable" : "protected"} inline ${structured ? "structure component" : "reference"}`;
      it(`retains a ${description} when READ TABLE fails in a loop`, () => {
        const rowType = structured ? "ty_row" : "REF TO lcl_owner=>ty_items";
        const pointer = structured ? "selected-pointer" : "selected";
        const issues = run(`TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_row.
          DATA rows TYPE STANDARD TABLE OF ${rowType} WITH DEFAULT KEY.
          DO 2 TIMES.
            IF sy-index = 2.
              READ TABLE rows INDEX 1 INTO DATA(selected).
              SORT ${pointer}->*.
            ENDIF.
            ${pointer} = REF #( ${writable ? "mutable_items" : "owner->items"} ).
          ENDDO.`);
        expect(issues).to.have.length(writable ? 0 : 1);
      });
    }

    it(`READ TABLE TRANSPORTING retains an excluded ${writable ? "writable" : "protected"} nested pointer`, () => {
      const issues = run(`TYPES: BEGIN OF ty_nested, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_nested.
          TYPES: BEGIN OF ty_row, nested TYPE ty_nested, number TYPE i, END OF ty_row.
          DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
          DATA selected TYPE ty_row. DATA incoming TYPE ty_row.
          selected-nested-pointer = REF #( ${writable ? "mutable_items" : "owner->items"} ).
          incoming-nested-pointer = REF #( ${writable ? "owner->items" : "mutable_items"} ).
          APPEND incoming TO rows.
          READ TABLE rows INDEX 1 INTO selected TRANSPORTING number.
          SORT selected-nested-pointer->*.`);
      expect(issues).to.have.length(writable ? 0 : 1);
      if (!writable) {
        expect(issues[0].getSeverity()).to.equal(Severity.Error);
      }
    });

    for (const field of ["nested", "nested-pointer"]) {
      it(`READ TABLE TRANSPORTING ${field} transfers a ${writable ? "writable" : "protected"} nested reference`, () => {
        const issues = run(`TYPES: BEGIN OF ty_nested, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_nested.
          TYPES: BEGIN OF ty_row, nested TYPE ty_nested, END OF ty_row.
          DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
          DATA selected TYPE ty_row. DATA incoming TYPE ty_row.
          incoming-nested-pointer = REF #( ${writable ? "mutable_items" : "owner->items"} ).
          APPEND incoming TO rows.
          READ TABLE rows INDEX 1 INTO selected TRANSPORTING ${field}.
          SORT selected-nested-pointer->*.`);
        expect(issues).to.have.length(writable ? 0 : 1);
      });
    }
  }

  for (const writable of [false, true]) {
    it(`MODIFY INDEX transfers a ${writable ? "writable" : "protected"} reference component`, () => {
      const issues = run(`TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, number TYPE i, END OF ty_row.
          DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
          DATA incoming TYPE ty_row.
          APPEND INITIAL LINE TO rows.
          incoming-pointer = REF #( ${writable ? "mutable_items" : "owner->items"} ).
          MODIFY rows FROM incoming INDEX 1.
          READ TABLE rows INDEX 1 INTO DATA(selected).
          SORT selected-pointer->*.`);
      expect(issues).to.have.length(writable ? 0 : 1);
    });
  }

  it("MODIFY INDEX retains possible protected rows after a writable replacement", () => {
    const issues = run(`TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, number TYPE i, END OF ty_row.
        DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
        DATA incoming TYPE ty_row.
        incoming-pointer = REF #( owner->items ).
        APPEND incoming TO rows.
        incoming-pointer = REF #( mutable_items ).
        MODIFY rows FROM incoming INDEX 1.
        READ TABLE rows INDEX 1 INTO DATA(selected).
        SORT selected-pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });
  for (const writable of [false, true]) {
    it(`MODIFY TABLE transfers a ${writable ? "writable" : "protected"} reference row`, () => {
      const issues = run(`DATA rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
          APPEND INITIAL LINE TO rows.
          DATA(incoming) = REF #( ${writable ? "mutable_items" : "owner->items"} ).
          MODIFY TABLE rows FROM incoming.
          READ TABLE rows INDEX 1 INTO DATA(selected).
          SORT selected->*.`);
      expect(issues).to.have.length(writable ? 0 : 1);
    });
  }

  it("MODIFY TABLE retains possible protected reference rows after a writable replacement", () => {
    const issues = run(`DATA rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
        DATA(incoming) = REF #( owner->items ).
        APPEND incoming TO rows.
        incoming = REF #( mutable_items ).
        MODIFY TABLE rows FROM incoming.
        READ TABLE rows INDEX 1 INTO DATA(selected).
        SORT selected->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("MODIFY WHERE TRANSPORTING transfers a protected reference component", () => {
    expect(run(`TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, number TYPE i, END OF ty_row.
      DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
      DATA incoming TYPE ty_row.
      APPEND INITIAL LINE TO rows.
      incoming-pointer = REF #( owner->items ).
      MODIFY rows FROM incoming TRANSPORTING pointer WHERE number = 1.
      READ TABLE rows INDEX 1 INTO DATA(selected).
      SORT selected-pointer->*.`)).to.have.length(1);
  });

  it("MODIFY TRANSPORTING excludes unlisted reference components", () => {
    expect(run(`TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, number TYPE i, END OF ty_row.
      DATA rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
      DATA incoming TYPE ty_row.
      incoming-pointer = REF #( mutable_items ).
      APPEND incoming TO rows.
      incoming-pointer = REF #( owner->items ).
      MODIFY rows FROM incoming INDEX 1 TRANSPORTING number.
      READ TABLE rows INDEX 1 INTO DATA(selected).
      SORT selected-pointer->*.`)).to.have.length(0);
  });

  for (const operation of ["APPEND", "INSERT", "assignment"]) {
    for (const writable of [false, true]) {
      it(`${operation} preserves ${writable ? "writable" : "protected"} reference rows built with VALUE`, () => {
        const value = `VALUE ty_rows( ( REF #( ${writable ? "mutable_items" : "owner->items"} ) ) )`;
        const copy = operation === "APPEND" ? `APPEND LINES OF ${value} TO copied.`
          : operation === "INSERT" ? `INSERT LINES OF ${value} INTO TABLE copied.` : `copied = ${value}.`;
        const issues = run(`TYPES ty_rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
          DATA copied TYPE ty_rows.
          ${copy}
          READ TABLE copied INDEX 1 INTO DATA(alias).
          SORT alias->*.`);
        expect(issues).to.have.length(writable ? 0 : 1);
        if (!writable) {
          expect(issues[0].getSeverity()).to.equal(Severity.Error);
        }
      });
    }
  }

  for (const operation of ["BASE", "LINES OF"]) {
    for (const writable of [false, true]) {
      it(`VALUE ${operation} preserves ${writable ? "writable" : "protected"} reference rows`, () => {
        const value = operation === "BASE" ? "VALUE ty_rows( BASE source ( ) )" : "VALUE ty_rows( ( LINES OF source ) )";
        const issues = run(`TYPES ty_rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
          DATA source TYPE ty_rows.
          APPEND REF #( ${writable ? "mutable_items" : "owner->items"} ) TO source.
          DATA(copied) = ${value}.
          READ TABLE copied INDEX 1 INTO DATA(alias).
          SORT alias->*.`);
        expect(issues).to.have.length(writable ? 0 : 1);
      });
    }
  }

  for (const operation of ["APPEND", "INSERT"]) {
    for (const structured of [false, true]) {
      for (const writable of [false, true]) {
        const reference = `REF #( ${writable ? "mutable_items" : "owner->items"} )`;
        const row = structured ? `VALUE #( pointer = ${reference} )` : reference;
        const types = structured
          ? `TYPES: BEGIN OF ty_row, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_row.
             TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.`
          : "TYPES ty_rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.";
        const copy = operation === "APPEND" ? "APPEND LINES OF source TO copied."
          : "INSERT LINES OF source INTO TABLE copied.";
        it(`${operation} LINES OF copies ${writable ? "writable" : "protected"} ${structured ? "structure" : "reference"} rows`, () => {
          const issues = run(`${types}
            DATA source TYPE ty_rows. DATA copied TYPE ty_rows.
            APPEND ${row} TO source.
            ${copy}
            READ TABLE copied INDEX 1 INTO DATA(alias).
            SORT alias${structured ? "-pointer" : ""}->*.`);
          expect(issues).to.have.length(writable ? 0 : 1);
          if (!writable) {
            expect(issues[0].getSeverity()).to.equal(Severity.Error);
          }
        });
      }
    }

    for (const ranged of [false, true]) {
      it(`${operation} LINES OF follows dereferenced tables${ranged ? " with a range" : ""}`, () => {
        const range = ranged ? " FROM 1 TO 1" : "";
        const copy = operation === "APPEND" ? `APPEND LINES OF source_ref->*${range} TO copied_ref->*.`
          : `INSERT LINES OF source_ref->*${range} INTO TABLE copied_ref->*.`;
        const issues = run(`TYPES ty_rows TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
          DATA source TYPE ty_rows. DATA copied TYPE ty_rows.
          APPEND REF #( owner->items ) TO source.
          DATA(source_ref) = REF #( source ). DATA(copied_ref) = REF #( copied ).
          ${copy}
          READ TABLE copied INDEX 1 INTO DATA(alias).
          SORT alias->*.`);
        expect(issues).to.have.length(1);
        expect(issues[0].getSeverity()).to.equal(Severity.Error);
      });
    }
  }

  for (const declaration of ["DATA local TYPE REF TO lcl_owner=>ty_items.",
    "DATA local TYPE REF TO lcl_owner=>ty_items VALUE IS INITIAL.",
    "STATICS local TYPE REF TO lcl_owner=>ty_items."]) {
    for (const writable of [false, true]) {
      it(`retains ${writable ? "writable" : "protected"} references across loop ${declaration}`, () => {
        const issues = run(`DO 2 TIMES.
          ${declaration}
          IF sy-index = 2. SORT local->*. ENDIF.
          local = REF #( ${writable ? "mutable_items" : "owner->items"} ).
        ENDDO.`);
        expect(issues).to.have.length(writable ? 0 : 1);
      });
    }
  }

  it("retains reference components of a declared structure across iterations", () => {
    expect(run(`TYPES: BEGIN OF ty_holder, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_holder.
      DO 2 TIMES.
        DATA holder TYPE ty_holder.
        IF sy-index = 2. SORT holder-pointer->*. ENDIF.
        holder-pointer = REF #( owner->items ).
      ENDDO.`)).to.have.length(1);
  });

  it("treats a hoisted declaration identically", () => {
    expect(run(`DATA local TYPE REF TO lcl_owner=>ty_items.
      DO 2 TIMES.
        IF sy-index = 2. SORT local->*. ENDIF.
        local = REF #( owner->items ).
      ENDDO.`)).to.have.length(1);
  });

  it("preserves report declaration storage across iterations", () => {
    expect(run(`DO 2 TIMES.
      DATA local TYPE REF TO lcl_owner=>ty_items.
      IF sy-index = 2. SORT local->*. ENDIF.
      local = REF #( owner->items ).
    ENDDO.`, true)).to.have.length(1);
  });

  it("retains reference components of a DATA BEGIN structure across iterations", () => {
    expect(run(`DO 2 TIMES.
      DATA: BEGIN OF holder, pointer TYPE REF TO lcl_owner=>ty_items, END OF holder.
      IF sy-index = 2. SORT holder-pointer->*. ENDIF.
      holder-pointer = REF #( owner->items ).
    ENDDO.`)).to.have.length(1);
  });

  for (const reset of ["CLEAR local.", "DATA(local) = REF #( mutable_items )."]) {
    it(`retains execution-time initialization for ${reset}`, () => {
      const declaration = reset.startsWith("CLEAR") ? "DATA local TYPE REF TO lcl_owner=>ty_items." : "";
      expect(run(`${declaration}
        DO 2 TIMES.
          ${reset}
          IF sy-index = 2. SORT local->*. ENDIF.
          local = REF #( owner->items ).
        ENDDO.`)).to.deep.equal([]);
    });
  }
});
