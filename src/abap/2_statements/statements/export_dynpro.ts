import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class ExportDynpro implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("EXPORT DYNPRO"),
                    new Source(),
                    new Source(),
                    new Source(),
                    new Source(),
                    str("ID"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}