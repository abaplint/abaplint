import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class Reserve implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("RESERVE"), new Source(), str("LINES"));

    return verNot(Version.Cloud, ret);
  }

}