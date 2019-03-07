import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Add extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("ADD"),
                    new Source(),
                    str("TO"),
                    new Target());

    return ret;
  }

}