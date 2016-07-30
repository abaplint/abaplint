import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "CLASS foobar IMPLEMENTATION.",
    "CLASS lcl_object_tabl DEFINITION INHERITING FROM lcl_objects_super FINAL.",
    ];

statementType(tests, "CLASS", Statements.Class);