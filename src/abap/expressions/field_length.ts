import {seq, opt, alt, str, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW, ParenRight, Plus} from "../tokens/";
import {FieldSymbol, Field, ArrowOrDash} from "./";

export class FieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const normal = seq(opt(tok(Plus)),
                       alt(reg(/^[\d\w]+$/), new FieldSymbol()),
                       opt(seq(new ArrowOrDash(), new Field())));

    const length = seq(tok(ParenLeft),
                       alt(normal, str("*")),
                       alt(tok(ParenRightW), tok(ParenRight)));

    return length;
  }
}