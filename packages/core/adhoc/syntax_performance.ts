import {Config, MemoryFile, Registry} from "../src";
import * as fs from "fs";

console.log("========================");

const file1 = new MemoryFile("abapgit.prog.abap", fs.readFileSync("./lexer_performance.abap", "utf-8"));
const reg = new Registry().addFile(file1);

reg.addFile(new MemoryFile("cx_root.clas.abap", `
CLASS cx_root DEFINITION ABSTRACT PUBLIC.
  PUBLIC SECTION.
    DATA previous TYPE REF TO cx_root.
    DATA textid   TYPE c LENGTH 32.

    METHODS constructor
      IMPORTING
        textid   LIKE textid OPTIONAL
        previous TYPE REF TO cx_root OPTIONAL.

    METHODS get_source_position
      EXPORTING
        program_name TYPE string
        include_name TYPE string
        source_line  TYPE i.

    INTERFACES if_message.
    ALIASES get_longtext FOR if_message~get_longtext.
    ALIASES get_text FOR if_message~get_text.

ENDCLASS.

CLASS cx_root IMPLEMENTATION.

  METHOD constructor.
  ENDMETHOD.

  METHOD get_source_position.
  ENDMETHOD.

  METHOD if_message~get_longtext.
  ENDMETHOD.

  METHOD if_message~get_text.
  ENDMETHOD.

ENDCLASS.`));

reg.addFile(new MemoryFile("cx_static_check.clas.abap", `
CLASS cx_static_check DEFINITION PUBLIC INHERITING FROM cx_root.
  PUBLIC SECTION.
    METHODS constructor
      IMPORTING
        textid   LIKE textid OPTIONAL
        previous TYPE REF TO cx_root OPTIONAL.
ENDCLASS.

CLASS cx_static_check IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.`));

reg.addFile(new MemoryFile("if_message.intf.abap", `
INTERFACE if_message PUBLIC.
  METHODS get_text RETURNING VALUE(result) TYPE string.

  METHODS get_longtext
    IMPORTING preserve_newlines TYPE abap_bool OPTIONAL
    RETURNING VALUE(result) TYPE string.
ENDINTERFACE.`));

reg.addFile(new MemoryFile("if_t100_message.intf.abap", `
INTERFACE if_t100_message PUBLIC.

  DATA t100key TYPE scx_t100key.

  CONSTANTS:
    BEGIN OF default_textid,
      msgid TYPE symsgid VALUE 'AB',
      msgno TYPE symsgno VALUE '123',
      attr1 TYPE scx_attrname VALUE '',
      attr2 TYPE scx_attrname VALUE '',
      attr3 TYPE scx_attrname VALUE '',
      attr4 TYPE scx_attrname VALUE '',
    END OF default_textid.

ENDINTERFACE.`));

reg.setConfig(new Config(`
{
  "global": {
    "files": "/src/**/*.*"
  },
  "dependencies": [],
  "syntax": {
    "version": "v755",
    "errorNamespace": "^(Z|Y|LCL_|TY_|LIF_)"
  },
  "rules": {
    "begin_end_names": true,
    "check_ddic": true,
    "check_include": true,
    "check_syntax": true,
    "global_class": true,
    "implement_methods": true,
    "method_implemented_twice": true,
    "parser_error": true,
    "superclass_final": true,
    "unknown_types": true,
    "xml_consistency": true
  }
}`));
reg.parse();

console.log("run syntax logic,");
const before = Date.now();
const issues = reg.findIssues();
console.dir(issues);
const runtime = Date.now() - before;
console.log("Total: " + runtime + "ms");
