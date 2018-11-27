import {seq, opt, alt, str, ver, star, per, Expression, IStatementRunnable} from "../combi";
import {Constant, FieldSub, TypeName, Integer} from "./";
import {Version} from "../../version";

export class TypeTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const likeType = alt(str("LIKE"), str("TYPE"));
    const header = str("WITH HEADER LINE");
    const initial = seq(str("INITIAL SIZE"), new Constant());

    const key = seq(str("WITH"),
                    opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                    opt(alt(str("DEFAULT"), str("SORTED"), ver(Version.v740sp02, str("EMPTY")))),
                    str("KEY"),
                    star(new FieldSub()));

    const typetable = seq(opt(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY"))),
                          str("TABLE"),
                          opt(str("OF")),
                          opt(str("REF TO")),
                          opt(new TypeName()),
                          opt(per(header, initial)),
                          opt(key));

    const occurs = seq(str("OCCURS"), new Integer());

    const old = seq(new TypeName(),
                    alt(seq(occurs, opt(header)),
                        header));

    const ret = seq(likeType,
                    alt(old, typetable));

    return ret;
  }
}