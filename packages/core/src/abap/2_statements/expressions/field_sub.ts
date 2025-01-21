import {seq, opt, starPrio, tok, regex as reg, Expression} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";
import {FieldLength} from "./field_length";

export class FieldSub extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(reg(/^\*?!?&?(\/\w+\/)?[a-zA-Z_%$\?][\w%$\$\*]*$/),
                    starPrio(seq(tok(Dash), reg(/^[\w%$\$\*]+$/))),
                    opt(FieldLength),
                    opt(TableBody));

    return ret;
  }
}