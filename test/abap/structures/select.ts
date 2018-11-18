import {structureType} from "../_utils";
import {Select} from "../../../src/abap/structures";

const cases = [
  {abap: "SELECT * FROM zfoo INTO ls_area. EXIT. ENDSELECT."},
];

structureType(cases, new Select());