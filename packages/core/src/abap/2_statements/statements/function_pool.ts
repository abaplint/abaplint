import {IStatement} from "./_statement";
import {str, seqs, opt, per} from "../combi";
import {Field, MessageClass, Integer} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionPool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const message = seqs("MESSAGE-ID", MessageClass);
    const line = seqs("LINE-SIZE", Integer);
    const no = str("NO STANDARD PAGE HEADING");

    return seqs("FUNCTION-POOL",
                Field,
                opt(per(message, line, no)));
  }

}