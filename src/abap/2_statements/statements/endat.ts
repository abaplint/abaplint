import {IStatement} from "./_statement";
import {str} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class EndAt implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDAT");
    return ret;
  }

}