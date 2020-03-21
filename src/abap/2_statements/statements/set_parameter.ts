import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class SetParameter implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SET PARAMETER ID"),
                    new Source(),
                    str("FIELD"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}