import {structureType} from "../_utils";
import {DynproLogic} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `PROCESS BEFORE OUTPUT.
  MODULE status_0100.

PROCESS AFTER INPUT.
  MODULE user_command_0100.`},
  {abap: `PROCESS BEFORE OUTPUT.
  MODULE pbo_1001.

PROCESS AFTER INPUT.
  MODULE pai_exit AT EXIT-COMMAND.
  FIELD trc_level VALUES (BETWEEN '0' AND '3').`},
];

structureType(cases, new DynproLogic());