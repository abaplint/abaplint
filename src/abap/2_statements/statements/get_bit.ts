import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetBit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("GET BIT"),
                    new Source(),
                    str("OF"),
                    new Source(),
                    str("INTO"),
                    new Target());

    return ret;
  }

}