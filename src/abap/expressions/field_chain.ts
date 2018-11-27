import {seq, opt, optPrio, alt, str, plus, star, Expression, IStatementRunnable} from "../combi";
import {Field, FieldSymbol, TableExpression, ArrowOrDash, FieldAll, FieldOffset, FieldLength} from "./";

export class FieldChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const chain = seq(alt(new Field(), new FieldSymbol()),
                      optPrio(plus(new TableExpression())),
                      star(seq(new ArrowOrDash(), alt(str("*"), new FieldAll()), opt(plus(new TableExpression())))));

    const ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}