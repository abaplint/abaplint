import {seq, opt, tok, alt, regex as reg, Expression, IStatementRunnable} from "../combi";
import {Plus} from "../tokens/";
import {SourceFieldSymbol, ArrowOrDash, ComponentName, SourceField} from "./";

export class FieldOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    const offset = seq(tok(Plus),
                       alt(reg(/^\d+$/), new SourceField(), new SourceFieldSymbol()),
                       opt(seq(new ArrowOrDash(), new ComponentName())));

    return offset;
  }
}