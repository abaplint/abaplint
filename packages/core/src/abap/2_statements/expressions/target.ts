import {seq, optPrio, tok, starPrio, altPrio, Expression} from "../combi";
import {TargetField, TargetFieldSymbol, NewObject, InlineData, InlineFS, TableExpression, FieldOffset, FieldLength, TableBody, ClassName, Cast, ComponentName} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";
import {Dereference} from "./dereference";
import {dynAttr, dynComp} from "./_dynamic_access";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), AttributeName);
    const comp = seq(tok(Dash), ComponentName);

    const something = starPrio(altPrio(Dereference, dynAttr(), attr, dynComp(), comp, TableExpression));

    const clas = seq(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrio(Cast, NewObject, clas, TargetField, TargetFieldSymbol);

    const fields = seq(optPrio(FieldOffset), optPrio(FieldLength));

    const optional = altPrio(TableBody, fields);

    return altPrio(InlineData, InlineFS, seq(start, something, optional));
  }
}
