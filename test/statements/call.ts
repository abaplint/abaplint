import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "cl_gui_cfw=>flush( ).",
  "cl_gui_cfw=>flush( ) .",
  "lif_object~delete( ).",
  "gui( )->go_home( ).",
  "cl_abap_unit_assert=>assert_subrc( msg = 'Error while parsing'(001) ).",
  "CALL METHOD (lv_class_name)=>jump.",
  "<ls_late>-obj->deserialize( iv_package = <ls_late>-package ).",
  "CALL METHOD ('CL_OO_FACTORY')=>('CREATE_INSTANCE').",
  "ro_html->add( |var\"\n| ).",
  "CALL METHOD o_conv->reset( ).",
  "lo_sdf->set_cell( ip_row = 7 ip_column = 'C' ip_value = -10  ).",
  "CALL METHOD lo_instance->('CREATE_CLIF_SOURCE').",
  "ii_client->request->set_header_field( name  = '~request_method' value = 'POST' ).",
  "mo_files->add_string( iv_extra  = 'source' iv_ext    = 'xml' ).",
  "mo_files->add_string( iv_extra  = 'source' ) ##NO_TEXT.",
];

statementType(tests, "CALL", Statements.Call);
