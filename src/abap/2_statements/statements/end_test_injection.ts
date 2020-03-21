import {IStatement} from "./_statement";
import {str} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class EndTestInjection implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("END-TEST-INJECTION");
  }

}