import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Field} from "../expressions";

export class Interface extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new Field(),
               opt(str("PUBLIC")));
  }

}