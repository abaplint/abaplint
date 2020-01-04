import {seq, opt, alt, str, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW, Plus} from "../tokens/";
import {SourceFieldSymbol, ComponentName, ArrowOrDash} from "./";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const normal = seq(opt(tok(Plus)),
                       alt(reg(/^[\d\w]+$/), new SourceFieldSymbol()),
                       opt(seq(new ArrowOrDash(), new ComponentName())));

    const length = seq(tok(ParenLeft),
                       alt(normal, str("*")),
                       tok(ParenRightW));

    return length;
  }
}