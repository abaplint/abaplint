import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Subtract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SUBTRACT",
                    Source,
                    "FROM",
                    Target);

    return ret;
  }

}