import {seqs, optPrio, str, star, tok, Expression, altPrio} from "../combi";
import {AttributeName, ClassName, SourceField, SourceFieldSymbol, TableExpression, ComponentName, FieldOffset, FieldLength, TableBody} from ".";
import {InstanceArrow, StaticArrow, Dash, DashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FieldChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const attr = seqs(tok(InstanceArrow), altPrio(new AttributeName(), str("*")));
    const comp = seqs(tok(Dash), optPrio(new ComponentName()));

    const chain = star(altPrio(attr, comp, new TableExpression()));

    const clas = seqs(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrio(clas, new SourceField(), new SourceFieldSymbol());

    const after = altPrio(tok(DashW),
                          seqs(optPrio(new TableBody()), optPrio(new FieldOffset()), optPrio(new FieldLength())));

    const ret = seqs(start, chain, after);

    return ret;
  }
}