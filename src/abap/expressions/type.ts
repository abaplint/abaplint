import {seq, opt, alt, str, Expression, IRunnable} from "../combi";
import {Constant, FieldChain, TableBody} from "./";

export class Type extends Expression {
  public getRunnable(): IRunnable {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    let type = seq(likeType,
                   opt(alt(str("LINE OF"),
                           str("REF TO"),
                           str("RANGE OF"))));

    let options = opt(def);

    let ret = seq(type,
                  new FieldChain(),
                  opt(new TableBody()),
                  alt(options, str("WITH HEADER LINE")));

    return ret;
  }
}