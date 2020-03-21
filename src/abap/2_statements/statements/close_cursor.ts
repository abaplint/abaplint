import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {SQLSource} from "../expressions";
import {Version} from "../../../version";

export class CloseCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CLOSE CURSOR"), new SQLSource());
    return verNot(Version.Cloud, ret);
  }

}