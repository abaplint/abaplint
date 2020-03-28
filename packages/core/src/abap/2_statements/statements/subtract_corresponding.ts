import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SubtractCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SUBTRACT-CORRESPONDING"),
                    new Source(),
                    str("FROM"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}