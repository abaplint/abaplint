import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Field} from "../expressions";

export class InterfaceDeferred extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new Field(),
               str("DEFERRED"),
               opt(str("PUBLIC")));
  }

}