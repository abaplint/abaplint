import {structureType} from "../../utils";
import {CatchSystemExceptions} from "../../../src/abap/structures";

let cases = [
  {abap: "CATCH SYSTEM-EXCEPTIONS code = 4. ENDCATCH."},
];

structureType(cases, new CatchSystemExceptions());