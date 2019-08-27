import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndAt extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDAT");
    return ret;
  }

}