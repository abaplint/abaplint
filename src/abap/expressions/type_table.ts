import {seq, opt, alt, str, ver, star, Reuse, IRunnable} from "../combi";
import {Constant, FieldSub, TypeName, Integer} from "./";
import {Version} from "../../version";

export class TypeTable extends Reuse {
  public get_runnable(): IRunnable {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let header = str("WITH HEADER LINE");
    let initial = seq(str("INITIAL SIZE"), new Constant());

    let key = seq(str("WITH"),
                  opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                  opt(alt(str("DEFAULT"), str("SORTED"), ver(Version.v740sp02, str("EMPTY")))),
                  str("KEY"),
                  star(new FieldSub()));

    let typetable = seq(opt(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY"))),
                        str("TABLE"),
                        opt(str("OF")),
                        opt(str("REF TO")),
                        opt(new TypeName()),
                        opt(header),
                        opt(initial),
                        opt(key));

    let occurs = seq(str("OCCURS"), new Integer());

    let old = seq(new TypeName(),
                  alt(seq(occurs, opt(header)),
                      header));

    let ret = seq(likeType,
                  alt(old, typetable));

    return ret;
  }
}