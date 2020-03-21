import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndClass extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDCLASS");
  }

}