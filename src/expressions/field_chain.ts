import {seq, opt, optPrio, alt, str, plus, star, Reuse, IRunnable} from "../combi";
import {Field, FieldSymbol, TableExpression, ArrowOrDash, FieldAll, FieldOffset, FieldLength} from "./";

export class FieldChain extends Reuse {
  public get_runnable(): IRunnable {

    let chain = seq(alt(new Field(), new FieldSymbol()),
                    optPrio(plus(new TableExpression())),
                    star(seq(new ArrowOrDash(), alt(str("*"), new FieldAll()), opt(plus(new TableExpression())))));

    let ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

    return ret;
  }
}