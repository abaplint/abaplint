import {structureType} from "../../utils";
import {ClassGlobal} from "../../../src/abap/structures";

let cases = [
  {abap: "CLASS zfoo DEFINITION. ENDCLASS. CLASS zfoo IMPLEMENTATION. ENDCLASS."},
];

structureType(cases, new ClassGlobal());