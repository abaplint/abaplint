import {seq, opt, tok, star, alt, str, altPrio, Expression, IStatementRunnable} from "../combi";
import {Field, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody} from "./";
import {FieldSymbol, InlineData, InlineFS, ArrowOrDash} from "./";
import {Arrow} from "../tokens/";

export class Target extends Expression {
  public getRunnable(): IStatementRunnable {
    const after = seq(alt(new Field(), new FieldSymbol()),
                      star(new TableExpression()),
                      star(seq(new ArrowOrDash(), alt(str("*"), new FieldAll()), star(new TableExpression()))));

    const fields = seq(opt(new FieldOffset()), opt(new FieldLength()));

    const ref = seq(tok(Arrow), str("*"));

    const optional = alt(new TableBody(), fields, ref);

    return altPrio(new InlineData(), new InlineFS(), seq(after, optional));
  }
}