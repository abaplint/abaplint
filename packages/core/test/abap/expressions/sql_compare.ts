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
    const abap = `dsf IN ( SELECT sdf FROM sdf AS sdfp JOIN sdf AS sdft ON sdf = sdfdfs )`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLCompare().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });
});