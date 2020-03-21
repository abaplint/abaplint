import {IStatement} from "./_statement";
import {str} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Continue implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("CONTINUE");
  }

}