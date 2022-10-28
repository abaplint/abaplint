import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Overlay implements IStatement {

  public getMatcher(): IStatementRunnable {
    const only = seq("ONLY", Source);

    const ret = seq("OVERLAY",
                    Target,
                    "WITH",
                    Source,
                    opt(only));

    return ret;
  }

}