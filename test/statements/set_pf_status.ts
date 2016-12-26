import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET PF-STATUS 'STATUS_0004'.",
  "SET PF-STATUS 'STATUS_0004' EXCLUDING lt_fcode.",
  "set pf-status 'FOO' of program 'ZFOO' excluding lt_exc.",
  "set pf-status 'LIST' immediately excluding ftab.",
];

statementType(tests, "SET PF-STATUS", Statements.SetPFStatus);