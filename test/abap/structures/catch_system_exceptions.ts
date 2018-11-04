import {structureType} from "../_utils";
import {CatchSystemExceptions} from "../../../src/abap/structures";

let cases = [
  {abap: "CATCH SYSTEM-EXCEPTIONS code = 4. ENDCATCH."},
];

structureType(cases, new CatchSystemExceptions());