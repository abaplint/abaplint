import {StrictAssignments, StrictAssignmentsConf} from "../../src/rules/strict_assignments";
import {testRule} from "./_utils";

const config = new StrictAssignmentsConf();
config.preventStructureToSimple = true;
config.preventLongerToShorter = true;

const typedefs = `
TYPES: t_shorter_char TYPE c LENGTH 10.
TYPES: t_longer_char TYPE c LENGTH 20.
TYPES: t_string TYPE string.

TYPES: 
  BEGIN OF t_struct,
    shorter TYPE t_shorter_char,
    longer  TYPE t_longer_char,
  END OF t_struct.

DATA: short  TYPE t_shorter_char.
DATA: long   TYPE t_longer_char.
DATA: string TYPE t_string.;
DATA: struct TYPE t_struct.
`;

const tests = [

  // same variable
  {abap: typedefs && " short  = short.", cnt: 1},
  {abap: typedefs && " struct = struct.", cnt: 1},

  {abap: typedefs && " struct-shorter = struct-shorter.", cnt: 1},

  // lengths
  {abap: typedefs && " short  = string.", cnt: 1},
  {abap: typedefs && " short  = long.", cnt: 1},

  {abap: typedefs && " long   = short.", cnt: 0},
  {abap: typedefs && " string = short.", cnt: 0},

  {abap: typedefs && " struct-shorter = struct-longer.", cnt: 1},
  {abap: typedefs && " struct-longer = struct-shorter.", cnt: 0},
  {abap: typedefs && " longer = struct-shorter.", cnt: 0},
  {abap: typedefs && " shorter = struct-longer.", cnt: 1},

  // structures
  {abap: typedefs && " short  = struct.", cnt: 1},
  {abap: typedefs && " long   = struct.", cnt: 1},
  {abap: typedefs && " string = struct.", cnt: 1},

  {abap: typedefs && " struct = short.", cnt: 1},
  {abap: typedefs && " struct = long.", cnt: 1},
  {abap: typedefs && " struct = string.", cnt: 1},

];

testRule(tests, StrictAssignments);