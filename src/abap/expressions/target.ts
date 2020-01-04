import {seq, opt, tok, star, alt, str, altPrio, Expression, IStatementRunnable} from "../combi";
import {Arrow, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody, ClassName, ComponentName, Cast} from "./";
import {TargetFieldSymbol, NewObject, InlineData, InlineFS} from "./";
import {InstanceArrow, StaticArrow} from "../tokens/";
import {ArrowOrDash} from "./arrow_or_dash";
import {TargetField} from "./target_field";

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