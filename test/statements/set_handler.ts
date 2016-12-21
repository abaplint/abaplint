import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET HANDLER me->on_event FOR mo_html_viewer.",
  "set handler handle_grid_drag for all instances activation ' '.",
  "SET HANDLER me->link_click FOR alv->get_event( ).",
];

statementType(tests, "SET HANDLER", Statements.SetHandler);