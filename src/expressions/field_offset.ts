import {seq, opt, tok, alt, regex as reg, Reuse, IRunnable} from "../combi";
import {Plus} from "../tokens/";
import {FieldSymbol, ArrowOrDash, Field} from "./";

export class FieldOffset extends Reuse {
  public get_runnable(): IRunnable {
    let offset = seq(tok(Plus),
                     alt(reg(/^[\d\w]+$/), new FieldSymbol()),
                     opt(seq(new ArrowOrDash(), new Field())));

    return offset;
  }
}