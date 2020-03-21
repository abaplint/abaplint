import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";

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