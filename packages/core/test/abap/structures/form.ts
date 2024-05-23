import {parse, structureType} from "../_utils";
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

//////////////////////////////////////////////

describe("Structure FORM", () => {

  it.skip("FORM, many statements", () => {
    let abap = `
DATA lv TYPE string.
DEFINE x. lv = lv && &1. END-OF-DEFINITION.

FORM foobar1.
\n`;

    for (let i = 0; i < 70000; i++) {
      abap += "x 'hello'.\n";
    }
    abap += "ENDFORM.\n";
    parse(abap);
  });

});