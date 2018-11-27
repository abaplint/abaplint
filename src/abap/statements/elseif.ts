import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Cond} from "../expressions";

export class ElseIf extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ELSEIF"), new Cond());
  }

}