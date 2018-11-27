import {seq, opt, tok, alt, regex as reg, Expression, IStatementRunnable} from "../combi";
import {Plus} from "../tokens/";
import {FieldSymbol, ArrowOrDash, Field} from "./";

export class FieldOffset extends Expression {
  public getRunnable(): IStatementRunnable {
    const offset = seq(tok(Plus),
                       alt(reg(/^[\d\w]+$/), new FieldSymbol()),
                       opt(seq(new ArrowOrDash(), new Field())));

    return offset;
  }
}