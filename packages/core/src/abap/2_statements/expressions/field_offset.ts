import {seq, tok, alt, regex as reg, Expression, starPrio} from "../combi";
import {Plus} from "../../1_lexer/tokens";
import {SourceFieldSymbol, ArrowOrDash, ComponentName, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FieldOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    const offset = seq(tok(Plus),
                       alt(reg(/^\d+$/), new SourceField(), new SourceFieldSymbol()),
                       starPrio(seq(new ArrowOrDash(), new ComponentName())));

    return offset;
  }
}