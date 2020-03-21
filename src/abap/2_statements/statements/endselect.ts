import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndSelect extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ENDSELECT");
  }

}