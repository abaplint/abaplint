import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {FieldSymbol} from "../expressions";

export class Unassign extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("UNASSIGN"), new FieldSymbol());
  }

}