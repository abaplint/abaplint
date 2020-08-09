import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import * as Expressions from "../../../src/abap/2_statements/expressions";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";

const tests = [
  {c: "|hello|", r: new Expressions.StringTemplate(), e: true},
  {c: "|{ lv_minutes alpha = in width = 2 }|", r: new Expressions.StringTemplate(), e: true},
  {c: "|{ condense( iv_fnam ) }({ iv_index ALIGN = RIGHT PAD = '0' WIDTH = len })|", r: new Expressions.StringTemplate(), e: true},
];

describe("Test expression, StringTemplate", () => {
  tests.forEach((test) => {
    const not = test.e === true ? "" : "not ";

    it("\"" + test.c + "\" should " + not + "match " + test.r.getName(), () => {
      const tokens = getTokens(test.c);
      const match = Combi.Combi.run(test.r.getRunnable(), tokens, Config.getDefault().getVersion());
      expect(match !== undefined).to.equals(test.e);
    });
  });
});