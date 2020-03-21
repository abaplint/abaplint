import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Multiply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("MULTIPLY"),
                    new Target(),
                    str("BY"),
                    new Source());

    return ret;
  }

}