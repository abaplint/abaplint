import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Add implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("ADD"),
                    new Source(),
                    str("TO"),
                    new Target());

    return ret;
  }

}