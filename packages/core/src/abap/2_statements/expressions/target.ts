import {seq, opt, tok, star, alt, str, altPrio, Expression} from "../combi";
import {TargetField, TargetFieldSymbol, NewObject, InlineData, InlineFS, Arrow, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody, ClassName, Cast, ComponentName} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), new AttributeName());
    const comp = seq(tok(Dash), new ComponentName());

    const something = star(altPrio(attr, comp, new TableExpression()));

    const cast = seq(alt(new Cast(), new NewObject()), new Arrow(), new FieldAll());

    const clas = seq(new ClassName(), tok(StaticArrow), new AttributeName());
    const start = alt(clas, new TargetField(), new TargetFieldSymbol(), cast);

    const fields = seq(opt(new FieldOffset()), opt(new FieldLength()));

    const ref = seq(tok(InstanceArrow), str("*"));

    const optional = alt(new TableBody(), fields, ref);

    return altPrio(new InlineData(), new InlineFS(), seq(start, something, optional));
  }
}