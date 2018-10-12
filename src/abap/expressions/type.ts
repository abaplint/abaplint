import {seq, opt, alt, str, Expression, IRunnable} from "../combi";
import {Constant, FieldChain, Source, Integer, TableBody} from "./";

export class Type extends Expression {
  public getRunnable(): IRunnable {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));
    let length = seq(str("LENGTH"), new Source());
    let decimals = seq(str("DECIMALS"), new Integer());

    let type = seq(likeType,
                   opt(alt(str("LINE OF"),
                           str("REF TO"),
                           str("RANGE OF"))));

    let options = seq(opt(def), opt(length), opt(decimals), opt(new TableBody()));

    let ret = seq(type,
                  new FieldChain(),
                  alt(options, str("WITH HEADER LINE")));

    return ret;
  }
}