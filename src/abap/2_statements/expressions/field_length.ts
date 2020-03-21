import {seq, opt, alt, str, tok, regex as reg, Expression} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ComponentName, ArrowOrDash, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const normal = seq(opt(tok(Plus)),
                       alt(reg(/^\d+$/), new SourceField(), new SourceFieldSymbol()),
                       opt(seq(new ArrowOrDash(), new ComponentName())));

    const length = seq(tok(ParenLeft),
                       alt(normal, str("*")),
                       tok(ParenRightW));

    return length;
  }
}