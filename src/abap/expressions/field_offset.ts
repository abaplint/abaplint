import {seq, opt, tok, alt, regex as reg, Expression, IRunnable} from "../combi";
import {Plus} from "../tokens/";
import {FieldSymbol, ArrowOrDash, Field} from "./";

export class FieldOffset extends Expression {
  public getRunnable(): IRunnable {
    const offset = seq(tok(Plus),
                       alt(reg(/^[\d\w]+$/), new FieldSymbol()),
                       opt(seq(new ArrowOrDash(), new Field())));

    return offset;
  }
}