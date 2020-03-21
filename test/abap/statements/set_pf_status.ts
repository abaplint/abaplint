import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET PF-STATUS 'STATUS_0004'.",
  "SET PF-STATUS 'STATUS_0004' EXCLUDING lt_fcode.",
  "set pf-status 'FOO' of program 'ZFOO' excluding lt_exc.",
  "set pf-status 'LIST' immediately excluding ftab.",
  "SET PF-STATUS foo-bar EXCLUDING excl OF PROGRAM modul-pool.",
];

statementType(tests, "SET PF-STATUS", Statements.SetPFStatus);