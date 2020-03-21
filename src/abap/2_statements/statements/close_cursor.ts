import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {SQLSource} from "../expressions";
import {Version} from "../../../version";

export class CloseCursor extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CLOSE CURSOR"), new SQLSource());
    return verNot(Version.Cloud, ret);
  }

}