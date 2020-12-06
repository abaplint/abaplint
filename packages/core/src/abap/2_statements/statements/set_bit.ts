import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetBit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET BIT",
                    Source,
                    "OF",
                    Target,
                    opts(seq("TO", Source)));

    return ret;
  }

}