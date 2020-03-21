import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Else extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("ELSE");
  }

}