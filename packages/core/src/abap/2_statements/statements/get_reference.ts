import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetReference implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("GET REFERENCE OF"),
                    new Source(),
                    str("INTO"),
                    new Target());

    return ret;
  }

}