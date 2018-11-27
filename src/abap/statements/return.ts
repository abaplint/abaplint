import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Return extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("RETURN");
  }

}