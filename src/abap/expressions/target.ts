import {seq, opt, tok, star, alt, str, altPrio, Expression, IStatementRunnable} from "../combi";
import {TargetField, ArrowOrDash, TargetFieldSymbol, NewObject, InlineData, InlineFS, Arrow, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody, ClassName, ComponentName, Cast} from "./";
import {InstanceArrow, StaticArrow} from "../tokens/";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const something = star(seq(new ArrowOrDash(), alt(str("*"), new FieldAll()), star(new TableExpression())));

    const cast = seq(alt(new Cast(), new NewObject()), new Arrow(), new FieldAll());

    const clas = seq(new ClassName(), tok(StaticArrow), new ComponentName());
    const start = alt(clas, new TargetField(), new TargetFieldSymbol(), cast);

    const after = seq(start,
                      star(new TableExpression()),
                      something);

    const fields = seq(opt(new FieldOffset()), opt(new FieldLength()));

    const ref = seq(tok(InstanceArrow), str("*"));

    const optional = alt(new TableBody(), fields, ref);

    return altPrio(new InlineData(), new InlineFS(), seq(after, optional));
  }
}