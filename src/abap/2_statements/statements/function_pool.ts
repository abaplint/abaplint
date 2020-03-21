import {IStatement} from "./_statement";
import {str, seq, opt, per} from "../combi";
import {Field, MessageClass, Integer} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionPool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const message = seq(str("MESSAGE-ID"), new MessageClass());
    const line = seq(str("LINE-SIZE"), new Integer());
    const no = str("NO STANDARD PAGE HEADING");

    return seq(str("FUNCTION-POOL"),
               new Field(),
               opt(per(message, line, no)));
  }

}