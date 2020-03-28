import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Transfer implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq(str("LENGTH"),
                       new Source());

    const ret = seq(str("TRANSFER"),
                    new Source(),
                    str("TO"),
                    new Target(),
                    opt(length),
                    opt(str("NO END OF LINE")));

    return verNot(Version.Cloud, ret);
  }

}