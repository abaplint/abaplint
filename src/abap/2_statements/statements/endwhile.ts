import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndWhile extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDWHILE");
  }

}