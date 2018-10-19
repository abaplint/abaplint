import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SELECT foo FROM ztable.",
  "SELECT sdfs FROM basdf WHERE name is null.",
  "select netwr from vbakuk into l_netwr where vbeln = l_vbeln and vbtyp in ('C').",
  "SELECT * INTO data FROM table WHERE name LIKE l_name ESCAPE '!' AND text NOT LIKE l_text ESCAPE '!'.",
  "SELECT node_key INTO CORRESPONDING FIELDS OF @<entity> FROM snwd_so WHERE (where_clause) ORDER BY (orderby_clause).",
  "SELECT vbeln INTO CORRESPONDING FIELDS OF lt_table FROM vbak WHERE (where_clause) ORDER BY (orderby_clause).",
  "SELECT field INTO l_val FROM table WHERE field1 IN var AND field2 LT sy-datum AND field3 GT sy-datum AND NOT field4 = 'X'.",
];

statementType(tests, "SELECT loop", Statements.SelectLoop);