import {IStatement} from "./_statement";
import {Select as eSelect} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Select implements IStatement {

  public getMatcher(): IStatementRunnable {
    return new eSelect();
  }

}
