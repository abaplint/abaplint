import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Try extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("TRY");
  }

}