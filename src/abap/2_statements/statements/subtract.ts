import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Subtract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SUBTRACT"),
                    new Source(),
                    str("FROM"),
                    new Target());

    return ret;
  }

}