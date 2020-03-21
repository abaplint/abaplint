import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Resume extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("RESUME");
  }

}