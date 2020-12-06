import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetBit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET BIT",
                    Source,
                    "OF",
                    Target,
                    opt(seq("TO", Source)));

    return ret;
  }

}