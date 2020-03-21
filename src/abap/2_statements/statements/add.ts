import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Add implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("ADD"),
                    new Source(),
                    str("TO"),
                    new Target());

    return ret;
  }

}