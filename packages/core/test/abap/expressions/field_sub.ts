/* eslint-disable no-multi-spaces */
import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import * as Expressions from "../../../src/abap/2_statements/expressions";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";

const tests = [
  {c: "bar",                       r: new Expressions.FieldSub(),      e: true},
  {c: "foo-bar",                   r: new Expressions.FieldSub(),      e: true},
  {c: "b",                         r: new Expressions.FieldSub(),      e: true},
  {c: "2",                         r: new Expressions.FieldSub(),      e: false},
  {c: "223423",                    r: new Expressions.FieldSub(),      e: false},
];

describe("Test expression, FieldSub", () => {
  tests.forEach((test) => {
    const not = test.e === true ? "" : "not ";

    it("\"" + test.c + "\" should " + not + "match " + test.r.getName(), () => {
      const tokens = getTokens(test.c);
      const match = Combi.Combi.run(test.r.getRunnable(), tokens, Config.getDefault().getVersion());
      expect(match !== undefined).to.equals(test.e);
    });
  });
});