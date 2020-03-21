import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndMethod extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDMETHOD");
  }

}