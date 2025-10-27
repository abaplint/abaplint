import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";
import {SQLCompare} from "../../../src/abap/2_statements/expressions";

describe("Test expression, SQLCompare", () => {
  it("test1", () => {
    const abap = `kunnr IN ( SELECT field FROM ztab )`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLCompare().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });

  it("test2", () => {
    const abap = `kunnr IN ( SELECT field FROM ztab AS p JOIN t001w AS t ON kunnr = sdfdfs )`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLCompare().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });
});