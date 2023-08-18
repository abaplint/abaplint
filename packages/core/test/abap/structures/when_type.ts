import {structureType} from "../_utils";
import {CaseType} from "../../../src/abap/3_structures/structures";

const cases = [
// this is an example from downport, where the inline is outlined, this is valid syntax,
  {abap: `CASE TYPE OF lo_artefact.
    DATA lo_message TYPE REF TO object.
    WHEN TYPE object INTO lo_message.
  ENDCASE.`},
];

structureType(cases, new CaseType());