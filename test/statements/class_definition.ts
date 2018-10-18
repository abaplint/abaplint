import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CLASS lcl_xml DEFINITION ABSTRACT.",
  "CLASS zcl_foo_super DEFINITION LOAD.",
  "CLASS zcl_foo DEFINITION ABSTRACT FINAL.",

  "CLASS ltcl_dang DEFINITION FOR TESTING RISK LEVEL CRITICAL DURATION LONG FINAL.",
  "CLASS ltcl_zlib DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT FINAL.",
  "CLASS ltcl_test DEFINITION FOR TESTING DURATION SHORT RISK LEVEL HARMLESS FINAL.",
  "CLASS ltcl_test DEFINITION FOR TESTING DURATION MEDIUM RISK LEVEL HARMLESS FINAL.",
  "CLASS ltcl_test DEFINITION FOR TESTING DURATION SHORT INHERITING FROM zcl_foo RISK LEVEL HARMLESS FINAL.",

  "CLASS lcl_xml_input DEFINITION FINAL INHERITING FROM lcl_xml CREATE PUBLIC.",
  "CLASS lcl_dot_abapgit DEFINITION CREATE PRIVATE FINAL FRIENDS ltcl_dot_abapgit.",
  "CLASS zcl_aoc_unit_test DEFINITION PUBLIC CREATE PUBLIC FOR TESTING.",
  "CLASS lcl_repo_srv DEFINITION FINAL CREATE PRIVATE FRIENDS lcl_app.",
  "CLASS lcl_object_tabl DEFINITION INHERITING FROM lcl_objects_super FINAL.",

  "CLASS ltcl_bobf DEFINITION FINAL FOR TESTING INHERITING FROM zcl_sdf DURATION MEDIUM RISK LEVEL DANGEROUS.",

  "class ZCL_c1 definition public create public global friends ZCL_c2 ZCL_c3.",
  "class zcl_foo definition public inheriting from zcl_super final create private global friends zcl_factory.",

  "class ZCL_SHARED_MEMORY_ROOT definition public final create public shared memory enabled.",
];

statementType(tests, "CLASS Definition", Statements.ClassDefinition);