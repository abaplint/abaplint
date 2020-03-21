import {structureType} from "../_utils";
import {CatchSystemExceptions} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "CATCH SYSTEM-EXCEPTIONS code = 4. ENDCATCH."},
];

structureType(cases, new CatchSystemExceptions());