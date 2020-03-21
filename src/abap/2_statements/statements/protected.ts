import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Protected extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("PROTECTED SECTION");
  }

}