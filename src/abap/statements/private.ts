import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Private extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("PRIVATE SECTION");
  }

}