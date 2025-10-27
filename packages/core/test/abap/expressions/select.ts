import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";
import {Select} from "../../../src/abap/2_statements/expressions";

describe("Test expression, Select", () => {
  it("test1", () => {
    const abap = `SELECT field FROM ztab AS p JOIN t001w AS t ON kunnr = foobarmoo`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new Select().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });

  it("test2", () => {
    const abap = `SELECT sdf FROM sdf AS sdfp JOIN sdf AS sdft ON sdf = sdfdfs`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new Select().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });
});