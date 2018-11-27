import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndFunction extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDFUNCTION");
  }

}