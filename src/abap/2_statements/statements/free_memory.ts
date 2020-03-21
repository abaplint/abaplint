import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class FreeMemory implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("FREE MEMORY ID"), new Source());

    return verNot(Version.Cloud, ret);
  }

}