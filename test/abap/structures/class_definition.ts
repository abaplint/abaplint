import {structureType} from "../../utils";
import {ClassDefinition} from "../../../src/abap/structures";

let cases = [
  {abap: "CLASS zfoo DEFINITION. ENDCLASS."},
];

structureType(cases, new ClassDefinition());