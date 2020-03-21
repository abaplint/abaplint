import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";

export class GetParameter implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("GET PARAMETER ID"),
                    new Source(),
                    str("FIELD"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}