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
    "version": "v702",
    "errorNamespace": "^(Z|Y|LCL_|TY_|LIF_)",
    "globalConstants": [
      "abap_func_exporting",
      "abap_func_tables",
      "cssf_formtype_text",
      "icon_abap",
      "icon_adopt",
      "icon_change",
      "icon_create",
      "icon_delete",
      "icon_display_text",
      "icon_folder",
      "icon_led_green",
      "icon_led_inactive",
      "icon_led_red",
      "icon_led_yellow",
      "icon_message_information",
      "icon_okay",
      "icon_set_state",
      "icon_stack",
      "icon_system_help",
      "icon_workflow_fork",
      "seoc_category_exception",
      "seoc_category_webdynpro_class",
      "seoc_exposure_private",
      "seoc_exposure_protected",
      "seoc_exposure_public",
      "seoc_state_implemented",
      "seoc_version_active",
      "seoc_version_deleted",
      "seoc_version_inactive",
      "seok_access_free",
      "seok_access_modify",
      "seox_false",
      "seok_pgmid_r3tr",
      "seoo_cmptype_type",
      "seoo_cmptype_event",
      "seoo_cmptype_method",
      "seoo_cmptype_attribute",
      "seop_ext_class_locals_def",
      "seop_ext_class_locals_imp",
      "seop_ext_class_macros",
      "seop_ext_class_testclasses",
      "seop_incextapp_definition",
      "seop_incextapp_implementation",
      "seop_incextapp_macros",
      "seop_incextapp_testclasses",
      "seos_scotype_exception",
      "seos_scotype_parameter",
      "seox_true",
      "sews_c_vif_version",
      "skwfc_obtype_folder",
      "skwfc_obtype_loio",
      "so2_controller",
      "icon_no_status",
      "icon_package_standard",
      "srext_ext_class_pool",
      "srext_ext_interface_pool",
      "ststc_c_type_dialog",
      "ststc_c_type_object",
      "ststc_c_type_parameters",
      "ststc_c_type_report",
      "swbm_c_op_delete_no_dialog",
      "swbm_c_type_ddic_db_tabxinx",
      "swbm_c_type_wdy_application",
      "swbm_version_active",
      "swbm_version_inactive",
      "wbmr_c_skwf_folder_class",
      "wdyn_limu_component_controller",
      "wdyn_limu_component_definition",
      "wdyn_limu_component_view"
    ]
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
