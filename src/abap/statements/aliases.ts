import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";

export class Aliases extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ALIASES"),
               new Field(),
               str("FOR"),
               new Field());
  }

}