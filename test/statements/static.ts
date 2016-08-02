import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "STATICS foo TYPE c.",
  "STATICS st_obj_serializer_map TYPE SORTED TABLE OF ty_obj_serializer_map WITH UNIQUE KEY item.",
];

statementType(tests, "STATIC", Statements.Static);