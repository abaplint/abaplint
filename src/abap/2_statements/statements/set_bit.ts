import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetBit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SET BIT"),
                    new Source(),
                    str("OF"),
                    new Target(),
                    opt(seq(str("TO"), new Source())));

    return ret;
  }

}