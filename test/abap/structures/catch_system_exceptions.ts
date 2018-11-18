import {structureType} from "../_utils";
import {CatchSystemExceptions} from "../../../src/abap/structures";

const cases = [
  {abap: "CATCH SYSTEM-EXCEPTIONS code = 4. ENDCATCH."},
];

structureType(cases, new CatchSystemExceptions());