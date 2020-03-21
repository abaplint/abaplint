import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class Position implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("POSITION"), new Source());

    return verNot(Version.Cloud, ret);
  }

}