import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "WAIT UP TO 1 SECONDS.",
  "WAIT UNTIL foo >= bar.",
  "WAIT UNTIL foo >= bar UP TO 1 SECONDS.",
  "WAIT FOR MESSAGING CHANNELS UNTIL foobar = abap_true UP TO 10 SECONDS.",
];

statementType(tests, "WAIT", Statements.Wait);