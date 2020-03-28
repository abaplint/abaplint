import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ConvertText implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CONVERT TEXT"),
               new Source(),
               str("INTO SORTABLE CODE"),
               new Target());
  }

}