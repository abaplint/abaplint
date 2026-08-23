import {NoDynamicStuff, NoDynamicStuffConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},

  // CALL METHOD
  {abap: "CALL METHOD (lv_class)=>(lv_method).", cnt: 1},
  {abap: "CALL METHOD lo_obj->(lv_method).", cnt: 1},
  {abap: "CALL METHOD lo_obj->meth.", cnt: 0},
  {abap: "CALL METHOD ('CL_FOO')=>('BAR').", cnt: 0},
  {abap: "cl_foo=>bar( ).", cnt: 0},
  {abap: "lo_obj->meth( iv_foo = tab[ 1 ] ).", cnt: 0},
  {abap: "CALL BADI lo_badi->(lv_method).", cnt: 1},
  {abap: "SET HANDLER lo_obj->(lv_method) FOR lo_source.", cnt: 1},
  {abap: "SET HANDLER lo_obj->on_event FOR lo_source.", cnt: 0},

  // CALL FUNCTION
  {abap: "CALL FUNCTION lv_name.", cnt: 1},
  {abap: "CALL FUNCTION 'ZFOO'.", cnt: 0},
  {abap: "CALL FUNCTION 'ZFOO' EXPORTING iv_bar = lv_baz.", cnt: 0},

  // CALL DATABASE PROCEDURE
  {abap: "CALL DATABASE PROCEDURE (lv_name).", cnt: 1},

  // CALL TRANSFORMATION
  {abap: "CALL TRANSFORMATION (lv_name) SOURCE XML lv_xml RESULT XML lv_res.", cnt: 1},
  {abap: "CALL TRANSFORMATION id SOURCE XML lv_xml RESULT XML lv_res.", cnt: 0},

  // CALL TRANSACTION
  {abap: "CALL TRANSACTION lv_tcode.", cnt: 1},
  {abap: "CALL TRANSACTION 'SE38'.", cnt: 0},

  // PERFORM
  {abap: "PERFORM (lv_form).", cnt: 1},
  {abap: "PERFORM foo.", cnt: 0},
  {abap: "PERFORM foo IN PROGRAM (lv_prog).", cnt: 1},

  // SUBMIT
  {abap: "SUBMIT (lv_prog).", cnt: 1},
  {abap: "SUBMIT zfoo.", cnt: 0},

  // CREATE OBJECT
  {abap: "CREATE OBJECT ref TYPE (lv_class).", cnt: 1},
  {abap: "CREATE OBJECT ref TYPE cl_bar.", cnt: 0},
  {abap: "CREATE OBJECT ref.", cnt: 0},

  // CREATE DATA
  {abap: "CREATE DATA ref TYPE (lv_type).", cnt: 1},
  {abap: "CREATE DATA ref TYPE string.", cnt: 0},

  // GET BADI
  {abap: "GET BADI lo_badi TYPE (lv_name).", cnt: 1},

  // ASSIGN
  {abap: "ASSIGN (lv_name) TO <fs>.", cnt: 1},
  {abap: "ASSIGN lo_ref->(lv_comp) TO <fs>.", cnt: 1},
  {abap: "ASSIGN COMPONENT lv_comp OF STRUCTURE ls_data TO <fs>.", cnt: 1},
  {abap: "ASSIGN COMPONENT 'FOO' OF STRUCTURE ls_data TO <fs>.", cnt: 0},
  {abap: "ASSIGN foo TO <fs>.", cnt: 0},
  {abap: "ASSIGN foo TO <fs> CASTING TYPE (lv_type).", cnt: 1},
  {abap: "ASSIGN LOCAL COPY OF MAIN TABLE FIELD (lv_name) TO <fs>.", cnt: 1},

  // internal tables
  {abap: "SORT tab BY (lv_field).", cnt: 1},
  {abap: "SORT tab BY field.", cnt: 0},
  {abap: "LOOP AT tab INTO ls_row WHERE (lv_cond).\nENDLOOP.", cnt: 1},
  {abap: "LOOP AT tab INTO ls_row WHERE field = 2.\nENDLOOP.", cnt: 0},
  {abap: "READ TABLE tab WITH KEY (lv_name) = 2 INTO ls_row.", cnt: 1},
  {abap: "READ TABLE tab WITH KEY field = 2 INTO ls_row.", cnt: 0},
  {abap: "DELETE tab WHERE (lv_cond).", cnt: 1},
  {abap: "MODIFY tab FROM ls_row TRANSPORTING (lv_field) WHERE (lv_cond).", cnt: 1},
  {abap: "AT NEW (lv_field).", cnt: 1},

  // EXPORT and IMPORT
  {abap: "EXPORT (lv_tab) TO MEMORY ID 'BAR'.", cnt: 1},
  {abap: "IMPORT (lv_tab) FROM MEMORY ID 'BAR'.", cnt: 1},
  {abap: "EXPORT foo = bar TO MEMORY ID 'BAR'.", cnt: 0},

  // dynamic SQL is reported by rule dangerous_statement
  {abap: "SELECT * FROM (lv_table) INTO TABLE @DATA(lt_rows).", cnt: 0},
];

testRule(tests, NoDynamicStuff);

function conf(enable: keyof NoDynamicStuffConf): NoDynamicStuffConf {
  const config = new NoDynamicStuffConf();
  for (const key of Object.keys(config)) {
    if (typeof (config as any)[key] === "boolean") {
      (config as any)[key] = false;
    }
  }
  (config as any)[enable] = true;
  return config;
}

const onlyCallMethod = [
  {abap: "CALL METHOD lo_obj->(lv_method).", cnt: 1},
  {abap: "CALL FUNCTION lv_name.", cnt: 0},
  {abap: "ASSIGN (lv_name) TO <fs>.", cnt: 0},
  {abap: "SORT tab BY (lv_field).", cnt: 0},
];

testRule(onlyCallMethod, NoDynamicStuff, conf("callMethod"), "test no_dynamic_stuff rule, only callMethod");

const onlyInternalTable = [
  {abap: "CALL METHOD lo_obj->(lv_method).", cnt: 0},
  {abap: "ASSIGN (lv_name) TO <fs>.", cnt: 0},
  {abap: "SORT tab BY (lv_field).", cnt: 1},
  {abap: "DELETE tab WHERE (lv_cond).", cnt: 1},
];

testRule(onlyInternalTable, NoDynamicStuff, conf("internalTable"), "test no_dynamic_stuff rule, only internalTable");
