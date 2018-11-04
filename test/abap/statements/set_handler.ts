import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "SET HANDLER me->on_event FOR mo_html_viewer.",
  "set handler handle_grid_drag for all instances activation ' '.",
  "set handler handler1 handler2 for all instances.",
  "SET HANDLER me->link_click FOR alv->get_event( ).",
  "set handler foobar.",
  "SET HANDLER foobar ACTIVATION ' '.",
];

statementType(tests, "SET HANDLER", Statements.SetHandler);