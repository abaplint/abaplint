import {seq, tok, alt, regex as reg, Expression, IStatementRunnable, starPrio} from "../combi";
import {Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ArrowOrDash, ComponentName, SourceField} from ".";

export class FieldOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    const offset = seq(tok(Plus),
                       alt(reg(/^\d+$/), new SourceField(), new SourceFieldSymbol()),
                       starPrio(seq(new ArrowOrDash(), new ComponentName())));

    return offset;
  }
}