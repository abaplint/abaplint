import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FIELD sdfds MODULE sdfs ON INPUT.",
  "FIELD sdfds MODULE sdfs.",
  "field go->gv module sdfsd on request.",
  "field foo-bar.", // used in CHAINs
  "FIELD foo-bar MODULE check_matnr ON CHAIN-REQUEST.",
  `FIELD foo-bar WITH bar-moo.`,
  `field foo-bar select * from ztab
                        where field = foo-bar into result
                        whenever not found
                        send errormessage.`,
  `FIELD foo-bar MODULE moo AT CURSOR-SELECTION.`,
  `FIELD MARC-WERKS SELECT * FROM T001W WHERE WERKS = MARC-WERKS.`,
];

statementType(tests, "FIELD", Statements.Field);