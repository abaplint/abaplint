import {seq, optPrio, tok, starPrio, altPrio, Expression, ver} from "../combi";
import {TargetField, TargetFieldSymbol, NewObject, InlineData, InlineFS, TableExpression, FieldOffset, FieldLength, TableBody, ClassName, Cast, ComponentName} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";
import {Dereference} from "./dereference";
import {Version} from "../../../version";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), AttributeName);
    const comp = seq(tok(Dash), ComponentName);

    const deref = ver(Version.v756, Dereference);

    const something = starPrio(altPrio(deref, attr, comp, TableExpression));

    const clas = seq(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrio(Cast, NewObject, clas, TargetField, TargetFieldSymbol);

    const fields = seq(optPrio(FieldOffset), optPrio(FieldLength));

    const optional = altPrio(TableBody, fields);

    return altPrio(InlineData, InlineFS, seq(start, something, optional));
  }
}