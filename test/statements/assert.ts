import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "ASSERT <lv_field> IS ASSIGNED.",
    ];

statementType(tests, "ASSERT", Statements.Assert);