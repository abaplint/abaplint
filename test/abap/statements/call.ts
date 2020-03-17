import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "cl_gui_cfw=>flush( ).",
  "cl_gui_cfw=>flush( ) .",
  "cl_gui_cfw=>flush(\r\n) .",
  "lif_object~delete( ).",
  "gui( )->go_home( ).",
  "cl_abap_unit_assert=>assert_subrc( msg = 'Error while parsing'(001) ).",
  "CALL METHOD (lv_class_name)=>jump.",
  "<ls_late>-obj->deserialize( iv_package = <ls_late>-package ).",
  "CALL METHOD ('CL_OO_FACTORY')=>('CREATE_INSTANCE').",
  "ro_html->add( |var\"\\n| ).",
  "ro_html->add( |var{\nmoo }| ).",
  "CALL METHOD o_conv->reset( ).",
  "lo_sdf->set_cell( ip_row = 7 ip_column = 'C' ip_value = -10  ).",
  "CALL METHOD lo_instance->('CREATE_CLIF_SOURCE').",
  "ii_client->request->set_header_field( name  = '~request_method' value = 'POST' ).",
  "mo_files->add_string( iv_extra  = 'source' iv_ext    = 'xml' ).",
  "mo_files->add_string( iv_extra  = 'source' ) ##NO_TEXT.",
  "CALL METHOD lo_obj->(lv_method) PARAMETER-TABLE lt_parameters.",
  "CALL METHOD <ls_meta>-obj->(<ls_meta>-meta-handler) PARAMETER-TABLE lt_parameters.",
  "ro_html->add( '<thead><tr>' ).",
  "CALL METHOD (class)=>(meth) PARAMETER-TABLE ptab EXCEPTION-TABLE etab.",
  "zcl_demo_customer=>get( |{ zcl_demo_salesorder=>get( |{ it_key_tab[ name = 'SalesOrderId' ]-value }| )->get_kunnr( ) }| )->" +
    "zif_gw_methods~map_to_entity( REF #( er_entity ) ).",
  "lcl_foo=>bar( !name = !moo ).",

  "CALL METHOD lo_foo->bar\n" +
  "  IMPORTING\n" +
  "    field1 = DATA(lv_field1).",

  "CALL METHOD lo_foo->bar\n" +
  "  IMPORTING\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1)\n" +
  "    field1 = DATA(lv_field1).",

  "CALL METHOD lr_salv->get_sorts( )->add_sort(\n" +
  "  EXPORTING\n" +
  "    columnname = 'COLUMN'\n" +
  "    subtotal   = if_salv_c_bool_sap=>true ).",

  "moo( ).",
];

statementType(tests, "CALL", Statements.Call);
