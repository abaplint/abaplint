import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Divide implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("DIVIDE",
                    Target,
                    "BY",
                    Source);

    return ret;
  }

}