import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Multiply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("MULTIPLY",
                    Target,
                    "BY",
                    Source);

    return ret;
  }

}