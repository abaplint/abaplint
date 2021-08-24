import {seq, opt, alt, per, Expression, altPrio, optPrio} from "../combi";
import {Constant, FieldSub, TypeName, Integer} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";
import {TypeTableKeys} from "./type_table_keys";

export class TypeTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const header = "WITH HEADER LINE";
    const initial = seq("INITIAL SIZE", Constant);

    const normal1 = seq(opt(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                        "TABLE",
                        opt("OF"),
                        opt("REF TO"),
                        opt(TypeName));

    const likeType = seq(opt(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                         "TABLE OF",
                         optPrio("REF TO"),
                         opt(FieldChain),
                         opt(per(header, initial, TypeTableKeys)));

    const rangeType = seq("RANGE OF", TypeName, opt(header), opt(initial));
    const rangeLike = seq("RANGE OF", FieldSub, opt(header), opt(initial));

    const typetable = seq(normal1,
                          opt(per(header, initial, TypeTableKeys)));

    const occurs = seq("OCCURS", Integer);

    const oldType = seq(opt("REF TO"), TypeName, alt(seq(occurs, opt(header)), header));
    const oldLike = seq(opt("REF TO"), FieldChain, alt(seq(occurs, opt(header)), header));

    const ret = altPrio(
      seq(occurs, opt(header)),
      seq("LIKE", alt(oldLike, likeType, rangeLike)),
      seq("TYPE", alt(oldType, typetable, rangeType)));

    return ret;
  }

}
