import {seq, opt, alt, str, tok, regex as reg, Expression, starPrio} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ComponentName, ArrowOrDash, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const named = seq(alt(new SourceField(), new SourceFieldSymbol()),
                      starPrio(seq(new ArrowOrDash(), new ComponentName())));

    const normal = seq(opt(tok(Plus)),
                       alt(reg(/^\d+$/), named));

    const length = seq(tok(ParenLeft),
                       alt(normal, str("*")),
                       tok(ParenRightW));

    return length;
  }
}