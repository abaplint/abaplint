import {statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  "MOVE-CORRESPONDING EXACT <res> TO ls_line.",
  "move-corresponding ls_usbapilink to lr_usbapilink_cd->*.",
  "MOVE-CORRESPONDING bar TO bar KEEPING TARGET LINES.",
];

statementType(tests, "MOVE-CORRESPONDING", Statements.MoveCorresponding);

const versions = [
  {abap: "MOVE-CORRESPONDING gt_input TO gt_output EXPANDING NESTED TABLES KEEPING TARGET LINES.", ver: Version.v740sp05},
];

statementVersion(versions, "MOVE-CORRESPONDING", Statements.MoveCorresponding);