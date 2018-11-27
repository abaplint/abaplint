import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndCase extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDCASE");
  }

}