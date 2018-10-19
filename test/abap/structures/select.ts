import {structureType} from "../../utils";
import {Select} from "../../../src/abap/structures";

let cases = [
  {abap: "SELECT * FROM zfoo INTO ls_area. EXIT. ENDSELECT."},
];

structureType(cases, new Select());