import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetBit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("GET BIT",
                    Source,
                    "OF",
                    Source,
                    "INTO",
                    Target);

    return ret;
  }

}