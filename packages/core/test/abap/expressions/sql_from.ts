import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";
import {SQLFrom} from "../../../src/abap/2_statements/expressions";

describe("Test expression, SQLFrom", () => {
  it("test1", () => {
    const abap = `FROM but0bk AS b
  INNER JOIN but000 AS c
    ON b~partner = c~partner
  INNER JOIN but020 AS d
    ON b~partner = d~partner
  INNER JOIN adrc AS a
    ON d~addrnumber = a~addrnumber
  INNER JOIN cvi_vend_link AS l
    ON l~partner_guid = c~partner_guid`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLFrom().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });
});