import {seq, opt, optPrio, alt, str, plus, star, tok, Expression, IStatementRunnable} from "../combi";
import {SourceField, SourceFieldSymbol, TableExpression, ComponentName, FieldOffset, FieldLength} from "./";
import {InstanceArrow, StaticArrow, Dash} from "../tokens";
import {ClassName} from "./class_name";

export class FieldChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const arrow = alt(tok(InstanceArrow), tok(Dash));

    const chain = seq(optPrio(plus(new TableExpression())),
                      star(seq(arrow, alt(str("*"), new ComponentName()), opt(plus(new TableExpression())))));

    const clas = seq(new ClassName(), tok(StaticArrow), new ComponentName());
    const start = alt(clas, new SourceField(), new SourceFieldSymbol());

    const ret = seq(start, chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}