import {structureType} from "../_utils";
import {OnChange} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `
    on change of foo-bar.
    else.
    endon.`},
];

structureType(cases, new OnChange());