import {Release} from "../../../src/version";
import {statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";


const tests = [
  "MOVE-CORRESPONDING EXACT <res> TO ls_line.",
  "move-corresponding ls_usbapilink to lr_usbapilink_cd->*.",
  "MOVE-CORRESPONDING bar TO bar KEEPING TARGET LINES.",
  "MOVE-CORRESPONDING lt_foo[] TO lt_bar[].",
];

statementType(tests, "MOVE-CORRESPONDING", Statements.MoveCorresponding);

const versions = [
  {abap: "MOVE-CORRESPONDING gt_input TO gt_output EXPANDING NESTED TABLES KEEPING TARGET LINES.", rel: Release.v740sp05},
];

statementVersion(versions, "MOVE-CORRESPONDING", Statements.MoveCorresponding);