import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LoadReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("LOAD REPORT"),
                    new Source(),
                    str("PART"),
                    new Source(),
                    str("INTO"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}