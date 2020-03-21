import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Divide implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("DIVIDE"),
                    new Target(),
                    str("BY"),
                    new Source());

    return ret;
  }

}