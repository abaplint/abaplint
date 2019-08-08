import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Field, SimpleName} from "../expressions";

export class Aliases extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ALIASES"),
               new SimpleName(),
               str("FOR"),
               new Field());
  }

}