import {seq, opt, tok, star, alt, str, Reuse, IRunnable} from "../combi";
import {Field, TableExpression, FieldAll, FieldOffset, FieldLength, TableBody} from "./";
import {FieldSymbol, InlineData, InlineFS, ArrowOrDash} from "./";
import {Arrow} from "../tokens/";

export class Target extends Reuse {
  public get_runnable(): IRunnable {
    let after = seq(alt(new Field(), new FieldSymbol()),
                    star(new TableExpression()),
                    star(seq(new ArrowOrDash(), alt(str("*"), new FieldAll()), star(new TableExpression()))));

    let fields = seq(opt(new FieldOffset()), opt(new FieldLength()));

    let ref = seq(tok(Arrow), str("*"));

    let optional = alt(new TableBody(), fields, ref);

    return alt(new InlineData(), new InlineFS(), seq(after, optional));
  }
}