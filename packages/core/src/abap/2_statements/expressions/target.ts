import {seq, optPrio, tok, starPrio, altPrio, Expression} from "../combi";
import {TargetField, TargetFieldSymbol, NewObject, InlineData, InlineFS, Arrow, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody, ClassName, Cast, ComponentName} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";
import {Dereference} from "./dereference";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), AttributeName);
    const comp = seq(tok(Dash), ComponentName);

    const something = starPrio(altPrio(attr, comp, TableExpression));

    const cast = seq(altPrio(Cast, NewObject), Arrow, FieldAll);

    const clas = seq(ClassName, tok(StaticArrow), AttributeName);
    const start = altPrio(cast, clas, TargetField, TargetFieldSymbol);

    const fields = seq(optPrio(FieldOffset), optPrio(FieldLength));

    const optional = altPrio(TableBody, fields, Dereference);

    return altPrio(InlineData, InlineFS, seq(start, something, optional));
  }
}