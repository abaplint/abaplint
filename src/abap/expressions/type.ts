import {seq, opt, alt, str, Expression, IRunnable} from "../combi";
import {Constant, FieldChain, TableBody} from "./";

export class Type extends Expression {
  public getRunnable(): IRunnable {
    const likeType = alt(str("LIKE"), str("TYPE"));
    const def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    const type = seq(likeType,
                     opt(alt(str("LINE OF"),
                             str("REF TO"),
                             str("RANGE OF"))));

    const options = opt(def);

    const ret = seq(type,
                    new FieldChain(),
                    opt(new TableBody()),
                    alt(options, str("WITH HEADER LINE")));

    return ret;
  }
}