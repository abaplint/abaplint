import {seq, opt, alt, ver, per, Expression, altPrio, plus, plusPrio, optPrio} from "../combi";
import {Constant, FieldSub, TypeName, Integer, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class TypeTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const header = "WITH HEADER LINE";
    const initial = seq("INITIAL SIZE", Constant);

    const uniqueness = alt("NON-UNIQUE", "UNIQUE");
    const defaultKey = "DEFAULT KEY";
    const emptyKey = ver(Version.v740sp02, "EMPTY KEY");

    const key = seq("WITH",
                    opt(uniqueness),
                    altPrio(defaultKey, emptyKey,
                            seq(opt(alt("SORTED", "HASHED")),
                                "KEY",
                                alt(seq(Field, "COMPONENTS", plus(FieldSub)),
                                    plus(FieldSub)))));

    const normal1 = seq(opt(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                        "TABLE",
                        opt("OF"),
                        opt("REF TO"),
                        opt(TypeName));

    const likeType = seq(opt(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                         "TABLE OF",
                         optPrio("REF TO"),
                         opt(FieldChain),
                         opt(key),
                         opt(header));

    const rangeType = seq("RANGE OF", TypeName, opt(header), opt(initial));
    const rangeLike = seq("RANGE OF", FieldSub, opt(header), opt(initial));

    const typetable = seq(normal1,
                          opt(per(header, initial, plusPrio(key))));

    const occurs = seq("OCCURS", Integer);

    const oldType = seq(TypeName, alt(seq(occurs, opt(header)), header));
    const oldLike = seq(FieldSub, alt(seq(occurs, opt(header)), header));

    const ret = altPrio(
      seq("LIKE", alt(oldLike, likeType, rangeLike)),
      seq("TYPE", alt(oldType, typetable, rangeType)));

    return ret;
  }

}
