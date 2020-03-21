import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class Hide implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("HIDE"), new Source());

    return verNot(Version.Cloud, ret);
  }

}