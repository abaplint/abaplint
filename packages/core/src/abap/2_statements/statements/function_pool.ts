import {IStatement} from "./_statement";
import {str, seq, opt, pers} from "../combi";
import {Field, MessageClass, Integer} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionPool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const message = seq("MESSAGE-ID", MessageClass);
    const line = seq("LINE-SIZE", Integer);
    const no = str("NO STANDARD PAGE HEADING");

    return seq("FUNCTION-POOL",
               Field,
               opt(pers(message, line, no)));
  }

}