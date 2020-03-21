import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Multiply extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("MULTIPLY"),
                    new Target(),
                    str("BY"),
                    new Source());

    return ret;
  }

}