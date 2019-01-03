import {seq, opt, tok, star, alt, str, altPrio, Expression, IStatementRunnable} from "../combi";
import {Field, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody, ClassName, ComponentName} from "./";
import {FieldSymbol, InlineData, InlineFS} from "./";
import {InstanceArrow, StaticArrow, Dash} from "../tokens/";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const clas = seq(new ClassName(), tok(StaticArrow), new ComponentName());
    const start = alt(clas, new Field(), new FieldSymbol());

    const arrow = alt(tok(InstanceArrow), tok(Dash));

    const after = seq(start,
                      star(new TableExpression()),
                      star(seq(arrow, alt(str("*"), new FieldAll()), star(new TableExpression()))));

    const fields = seq(opt(new FieldOffset()), opt(new FieldLength()));

    const ref = seq(tok(InstanceArrow), str("*"));

    const optional = alt(new TableBody(), fields, ref);

    return altPrio(new InlineData(), new InlineFS(), seq(after, optional));
  }
}