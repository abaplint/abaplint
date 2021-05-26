import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Transfer implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq("LENGTH", Source);

    const ret = seq("TRANSFER",
                    Source,
                    "TO",
                    Source,
                    opt(length),
                    opt("NO END OF LINE"));

    return verNot(Version.Cloud, ret);
  }

}