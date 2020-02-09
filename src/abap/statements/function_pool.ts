import {Statement} from "./_statement";
import {str, seq, IStatementRunnable, optPrio} from "../combi";
import {Field, MessageClass, Integer} from "../expressions";

export class FunctionPool extends Statement {

  public getMatcher(): IStatementRunnable {
    const message = seq(str("MESSAGE-ID"), new MessageClass());
    const line = seq(str("LINE-SIZE"), new Integer());

    return seq(str("FUNCTION-POOL"),
               new Field(),
               optPrio(message),
               optPrio(line));
  }

}