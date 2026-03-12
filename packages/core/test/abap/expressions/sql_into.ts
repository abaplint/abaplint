import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";
import {SQLIntoList} from "../../../src/abap/2_statements/expressions";
import {Version} from "../../../src";

describe("Test expression, SQLIntoList", () => {

  it("space after opening parenthesis forbidden in 702", () => {
    const abap = `INTO ( ev_xvore, ev_xvorb, ev_xecht )`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLIntoList().getRunnable(), tokens, Version.v702);
    expect(match).to.equal(undefined);
  });

  it("space after opening parenthesis allowed post 702", () => {
    const abap = `INTO ( ev_xvore, ev_xvorb, ev_xecht )`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLIntoList().getRunnable(), tokens, Config.getDefault().getVersion());
    expect(match).to.not.equal(undefined);
  });
});