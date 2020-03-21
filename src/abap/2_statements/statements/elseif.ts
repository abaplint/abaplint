import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Cond} from "../expressions";

export class ElseIf implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ELSEIF"), new Cond());
  }

}