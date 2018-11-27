import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndLoop extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDLOOP");
  }

}