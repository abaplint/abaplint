import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TYPES sdf TYPE sdf ASSOCIATION sdf TO sdf ON sdf = sdf USING KEY sdf.",
];

statementType(tests, "TYPE MESH", Statements.TypeMesh);