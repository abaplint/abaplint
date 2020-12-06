import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Add implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ADD",
                    Source,
                    "TO",
                    Target);

    return ret;
  }

}