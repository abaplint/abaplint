import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

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