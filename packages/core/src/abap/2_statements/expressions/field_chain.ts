import {seq, optPrio, star, tok, Expression, altPrio, ver} from "../combi";
import {AttributeName, ClassName, SourceField, SourceFieldSymbol, TableExpression, ComponentName, FieldOffset, FieldLength, TableBody, Dereference} from ".";
import {InstanceArrow, StaticArrow, Dash, DashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class FieldChain extends Expression {
  public getRunnable(): IStatementRunnable {

    const attr = seq(tok(InstanceArrow), AttributeName);
    const comp = seq(tok(Dash), optPrio(ComponentName));

    const chain = star(altPrio(ver(Version.v756, Dereference), attr, comp, TableExpression));

    const clas = seq(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrio(clas, SourceField, SourceFieldSymbol);

    const after = altPrio(tok(DashW), seq(optPrio(TableBody), optPrio(FieldOffset), optPrio(FieldLength)));

    const ret = seq(start, chain, after);

    return ret;
  }
}