import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Retry extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("RETRY");
  }

}