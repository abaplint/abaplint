import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET PF-STATUS 'STATUS_0004' EXCLUDING lt_fcode.",
];

statementType(tests, "SET PF-STATUS", Statements.SetPFStatus);