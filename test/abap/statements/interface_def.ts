import {statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/statements/";
import {Version} from "../../../src/version";

const tests = [
  "INTERFACES lif_gui_page ABSTRACT METHODS render.",
  "INTERFACES zif_foo PARTIALLY IMPLEMENTED.",
  "interfaces zif_foo all methods abstract.",
  "interfaces zif_foo abstract methods ACTIVATE DEACTIVATE.",
  "interfaces zif_foo data values HEIGHT = 100 WIDTH = 100.",
  "INTERFACES zif_alog_logger FINAL METHODS entry.",
  "interfaces zif_foo all methods final.",
];

statementType(tests, "INTERFACES", Statements.InterfaceDef);

const versions = [
  {abap: "INTERFACES zif_foo PARTIALLY IMPLEMENTED.", ver: Version.v740sp02},
];

statementVersion(versions, "INTERFACES", Statements.InterfaceDef);