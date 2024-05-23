import {structureType} from "../_utils";
import {Form} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "FORM foo. ENDFORM."},
  {abap: "FORM foo. WRITE 'a'. ENDFORM."},
// check that dashes in variable names still create the structure
// intention is not to support this, but avoid the structural errors
  {abap: "FORM foo USING bar-foo. ENDFORM."},
  {abap: `form moo using value(bar)\ttype c.
  endform.`},
];

structureType(cases, new Form());

describe("Structure FORM", () => {

  it.only("program, different scope", () => {
    let abap = "FORM foobar1.\n";
    for (let i = 0; i < 500; i++) {
      abap += "WRITE 'hello'.\n";
    }
    abap += "ENDFORM.\n";
    structureType([{abap: abap}], new Form());
  });

});