import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Multiply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("MULTIPLY"),
                    new Target(),
                    str("BY"),
                    new Source());

    return ret;
  }

}