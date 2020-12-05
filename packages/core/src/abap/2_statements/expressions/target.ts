import {seqs, opt, tok, star, alt, altPrio, Expression} from "../combi";
import {TargetField, TargetFieldSymbol, NewObject, InlineData, InlineFS, Arrow, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody, ClassName, Cast, ComponentName} from ".";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AttributeName} from "./attribute_name";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seqs(tok(InstanceArrow), AttributeName);
    const comp = seqs(tok(Dash), ComponentName);

    const something = star(altPrio(attr, comp, new TableExpression()));

    const cast = seqs(alt(new Cast(), new NewObject()), Arrow, FieldAll);

    const clas = seqs(ClassName, tok(StaticArrow), AttributeName);
    const start = alt(clas, new TargetField(), new TargetFieldSymbol(), cast);

    const fields = seqs(opt(new FieldOffset()), opt(new FieldLength()));

    const ref = seqs(tok(InstanceArrow), "*");

    const optional = alt(new TableBody(), fields, ref);

    return altPrio(new InlineData(), new InlineFS(), seqs(start, something, optional));
  }
}