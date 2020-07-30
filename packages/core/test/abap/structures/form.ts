import {structureType} from "../_utils";
import {Form} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "FORM foo. ENDFORM."},
  {abap: "FORM foo. WRITE 'a'. ENDFORM."},
// check that dashes in variable names still create the structure
// intention is not to support this, but avoid the structural errors
  {abap: "FORM foo USING bar-foo. ENDFORM."},
];

structureType(cases, new Form());