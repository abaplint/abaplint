import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH.",
  "GET PROPERTY OF io_app_obj 'Charts' = lv_charts.",
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH EXPORTING foo = bar.",
  `GET PROPERTY OF sadf-OBJ PROPERTY = VALUE NO FLUSH QUEUE-ONLY
                    EXPORTING #1 = P1
                              #2 = P2
                              #3 = P3
                              #4 = P4.`,
  `GET PROPERTY OF foo-bar PROPERTY = val->moo-obj NO FLUSH QUEUE-ONLY.`,
  `GET PROPERTY OF foo-bar 'foo' = l_foo NO FLUSH QUEUEONLY.`,
];

statementType(tests, "GET PROPERTY", Statements.GetProperty);