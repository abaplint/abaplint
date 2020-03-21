import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ElseIf implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ELSEIF"), new Cond());
  }

}