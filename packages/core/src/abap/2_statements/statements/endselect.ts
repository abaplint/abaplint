import {IStatement} from "./_statement";
import {str} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class EndSelect implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDSELECT");
  }

}