import {seq, opt, alt, str, Reuse, IRunnable} from "../combi";
import {Constant, FieldChain, Source, Integer, TableBody} from "./";

export class Type extends Reuse {
  public get_runnable(): IRunnable {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));
    let length = seq(str("LENGTH"), new Source());
    let decimals = seq(str("DECIMALS"), new Integer());

    let type = seq(likeType,
                   opt(alt(str("LINE OF"),
                           str("REF TO"),
                           str("RANGE OF"))));

    let ret = seq(type,
                  new FieldChain(),
                  opt(def),
                  opt(length),
                  opt(decimals),
                  opt(new TableBody()));

    return ret;
  }
}