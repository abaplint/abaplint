import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndTestSeam extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("END-TEST-SEAM");
  }

}