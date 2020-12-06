import {seqs, optPrio, star, tok, Expression, altPrios} from "../combi";
import {AttributeName, ClassName, SourceField, SourceFieldSymbol, TableExpression, ComponentName, FieldOffset, FieldLength, TableBody} from ".";
import {InstanceArrow, StaticArrow, Dash, DashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FieldChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const attr = seqs(tok(InstanceArrow), altPrios(AttributeName, "*"));
    const comp = seqs(tok(Dash), optPrio(new ComponentName()));

    const chain = star(altPrios(attr, comp, TableExpression));

    const clas = seqs(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrios(clas, SourceField, SourceFieldSymbol);

    const after = altPrios(tok(DashW), seqs(optPrio(new TableBody()), optPrio(new FieldOffset()), optPrio(new FieldLength())));

    const ret = seqs(start, chain, after);

    return ret;
  }
}