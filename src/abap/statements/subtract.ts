import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Subtract extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SUBTRACT"),
                    new Source(),
                    str("FROM"),
                    new Target());

    return ret;
  }

}