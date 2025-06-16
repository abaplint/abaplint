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

  {abap: `
PROCESS BEFORE OUTPUT.

PROCESS AFTER INPUT.
  LOOP AT gt_data.
  ENDLOOP.`},

  {abap: `
PROCESS BEFORE OUTPUT.

PROCESS AFTER INPUT.
  LOOP AT tb_exit.
    CHAIN.
      FIELD sdf-grpno.
      MODULE sdf ON CHAIN-REQUEST.
    ENDCHAIN.
  ENDLOOP.
  MODULE twer.
`},

  {abap: `
PROCESS BEFORE OUTPUT.

PROCESS AFTER INPUT.
  LOOP AT idata.
    module data_value.
  ENDLOOP.

  MODULE USER_COMMAND_0150.
`},

  {abap: `
PROCESS BEFORE OUTPUT.

PROCESS AFTER INPUT.
  LOOP AT t_log_ven.
    CHAIN.
      FIELD t_log_ven-foo.
    ENDCHAIN.
    FIELD t_log_ven-bar MODULE mod ON REQUEST.
  ENDLOOP.
`},

  {abap: `
process before output.

process after input.
  loop with control tc_hdr.
    chain.
      field: zpro-selkz.
      module hdr_fill_table on chain-request.
    endchain.
  endloop.
  module user_command_header.
`},

  {abap: `
PROCESS BEFORE OUTPUT.

PROCESS AFTER INPUT.
  LOOP WITH CONTROL ctr1 .
    FIELD zfoobar-kunnr MODULE check_kunnr ON REQUEST.
  ENDLOOP.
`},

  {abap: `
PROCESS BEFORE OUTPUT.

PROCESS AFTER INPUT.

PROCESS ON HELP-REQUEST.

PROCESS ON VALUE-REQUEST.

`},
];

structureType(cases, new DynproLogic());