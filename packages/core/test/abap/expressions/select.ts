import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import {getTokens, statementVersionOk, statementVersionFail} from "../_utils";
import {Config} from "../../../src/config";
import {Select} from "../../../src/abap/2_statements/expressions";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

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

const privilegedLevelVersions = [
  {abap: `SELECT * FROM ztab WITH PRIVILEGED ACCESS LEVEL @lv_level INTO TABLE @DATA(lt).`,
    rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `SELECT SINGLE * FROM ztab WITH PRIVILEGED ACCESS LEVEL @lv_level INTO @DATA(ls).`,
    rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionOk(privilegedLevelVersions, "SELECT privileged access level", Statements.Select);

const privilegedLevelVersionsFail = [
  {abap: `SELECT * FROM ztab WITH PRIVILEGED ACCESS LEVEL @lv_level INTO TABLE @DATA(lt).`, rel: Release.v758},
];

statementVersionFail(privilegedLevelVersionsFail, "SELECT privileged access level");