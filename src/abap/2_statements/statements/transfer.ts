import {IStatement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";

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