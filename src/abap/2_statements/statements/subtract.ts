import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Subtract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SUBTRACT"),
                    new Source(),
                    str("FROM"),
                    new Target());

    return ret;
  }

}