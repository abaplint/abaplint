import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class WhenOthers implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("WHEN"), str("OTHERS"));
  }

}