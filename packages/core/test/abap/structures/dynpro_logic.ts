import {structureType} from "../_utils";
import {DynproLogic} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `PROCESS BEFORE OUTPUT.
  MODULE status_0100.

PROCESS AFTER INPUT.
  MODULE user_command_0100.`},
];

structureType(cases, new DynproLogic());