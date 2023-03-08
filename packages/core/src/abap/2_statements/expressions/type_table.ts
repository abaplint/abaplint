import {seq, opt, alt, per, Expression, altPrio, optPrio, plusPrio, plus, ver} from "../combi";
import {Constant, TypeName, Integer, SimpleFieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";
import {TypeTableKey} from "./type_table_key";
import {Version} from "../../../version";

export class TypeTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const header = "WITH HEADER LINE";
    const initial = seq("INITIAL SIZE", Constant);

    const generic = seq(opt(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")), "TABLE");

    const normal1 = seq(opt(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                        "TABLE OF",
                        opt("REF TO"),
                        opt(TypeName));

    const likeType = seq(opt(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                         "TABLE OF",
                         optPrio("REF TO"),
                         opt(FieldChain),
                         opt(per(header, initial, plusPrio(TypeTableKey))));

    const rangeType = seq("RANGE OF", TypeName, opt(header), opt(initial));
    const rangeLike = seq("RANGE OF", SimpleFieldChain, opt(header), opt(initial));

    // a maximum of 15 secondary table keys can be defined
    // "WITH" is not allowed as a field name in keys
    const typetable = alt(generic,seq(normal1,
                          alt(opt(per(header, initial, plusPrio(TypeTableKey))),
                              seq(plus(TypeTableKey), optPrio(initial)))));

    const occurs = seq("OCCURS", Integer);

    const derived = ver(Version.v754, seq("TABLE FOR", altPrio(
      "ACTION IMPORT",
      "ACTION RESULT",
      "CREATE",
      "FAILED",
      "LOCK",
      "READ RESULT",
      "UPDATE",
    ), TypeName));

    const oldType = seq(opt("REF TO"), TypeName, alt(seq(occurs, opt(header)), header));
    const oldLike = seq(opt("REF TO"), FieldChain, alt(seq(occurs, opt(header)), header));

    const ret = altPrio(
      seq(occurs, opt(header)),
      seq("LIKE", alt(oldLike, likeType, rangeLike)),
      seq("TYPE", alt(oldType, typetable, rangeType, derived)));

    return ret;
  }

}
