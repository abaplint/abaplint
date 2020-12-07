import {seq, opt, tok, star, alt, altPrio, Expression} from "../combi";
import {TargetField, TargetFieldSymbol, NewObject, InlineData, InlineFS, Arrow, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody, ClassName, Cast, ComponentName} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), AttributeName);
    const comp = seq(tok(Dash), ComponentName);

    const something = star(altPrio(attr, comp, TableExpression));

    const cast = seq(alt(Cast, NewObject), Arrow, FieldAll);

    const clas = seq(ClassName, tok(StaticArrow), AttributeName);
    const start = alt(clas, TargetField, TargetFieldSymbol, cast);

    const fields = seq(opt(FieldOffset), opt(FieldLength));

    const ref = seq(tok(InstanceArrow), "*");

    const optional = alt(TableBody, fields, ref);

    return altPrio(InlineData, InlineFS, seq(start, something, optional));
  }
}