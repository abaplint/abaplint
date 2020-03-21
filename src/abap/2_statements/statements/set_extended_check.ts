import {Statement} from "./_statement";
import {verNot, str, seq, alt, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class SetExtendedCheck extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SET EXTENDED CHECK"), alt(str("OFF"), str("ON")));

    return verNot(Version.Cloud, ret);
  }

}