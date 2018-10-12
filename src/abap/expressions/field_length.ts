import {seq, opt, alt, str, tok, regex as reg, Expression, IRunnable} from "../combi";
import {ParenLeft, ParenRightW, ParenRight} from "../tokens/";
import {FieldSymbol, Field, ArrowOrDash} from "./";

export class FieldLength extends Expression {
  public getRunnable(): IRunnable {
    let normal = seq(alt(reg(/^[\d\w]+$/), new FieldSymbol()),
                     opt(seq(new ArrowOrDash(), new Field())));

    let length = seq(tok(ParenLeft),
                     alt(normal, str("*")),
                     alt(tok(ParenRightW), tok(ParenRight)));

    return length;
  }
}