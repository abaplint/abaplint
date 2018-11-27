import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Public extends Statement {

  public getMatcher(): IStatementRunnable {
    return str("PUBLIC SECTION");
  }

}