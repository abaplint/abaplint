import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Field, MessageClass} from "../expressions";

export class FunctionPool extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("FUNCTION-POOL"),
               new Field(),
               opt(seq(str("MESSAGE-ID"), new MessageClass())));
  }

}