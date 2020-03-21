import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndInterface extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDINTERFACE");
  }

}