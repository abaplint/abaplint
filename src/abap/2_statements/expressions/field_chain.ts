import {seq, opt, optPrio, alt, str, plus, star, tok, Expression, IStatementRunnable, altPrio} from "../combi";
import {ClassName, SourceField, SourceFieldSymbol, TableExpression, ComponentName, FieldOffset, FieldLength} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";

export class FieldChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const arrow = alt(tok(InstanceArrow), tok(Dash));

    const chain = seq(optPrio(plus(new TableExpression())),
                      star(seq(arrow, alt(str("*"), new ComponentName()), opt(plus(new TableExpression())))));

    const clas = seq(new ClassName(), tok(StaticArrow), new ComponentName());
    const start = altPrio(clas, new SourceField(), new SourceFieldSymbol());

    const ret = seq(start, chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}