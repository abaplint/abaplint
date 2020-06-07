import {seq, optPrio, alt, str, plus, star, tok, Expression, altPrio} from "../combi";
import {AttributeName, ClassName, SourceField, SourceFieldSymbol, TableExpression, ComponentName, FieldOffset, FieldLength} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FieldChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const attr = seq(tok(InstanceArrow), alt(new AttributeName(), str("*")));
    const comp = seq(tok(Dash), new ComponentName());

    const chain = seq(optPrio(plus(new TableExpression())),
                      star(seq(altPrio(attr, comp), optPrio(plus(new TableExpression())))));

    const clas = seq(new ClassName(), tok(StaticArrow), new AttributeName());
    const start = altPrio(clas, new SourceField(), new SourceFieldSymbol());

    const ret = seq(start, chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}