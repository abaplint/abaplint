import {structureType} from "../_utils";
import {Constants} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `
CONSTANTS BEGIN OF bar.
INCLUDE zincl.
CONSTANTS END OF bar.`},
];

structureType(cases, new Constants());