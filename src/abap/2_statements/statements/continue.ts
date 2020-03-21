import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Continue extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("CONTINUE");
  }

}