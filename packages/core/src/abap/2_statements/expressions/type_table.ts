import {seq, opts, alt, vers, pers, Expression, altPrio, pluss, plusPrios, optPrios} from "../combi";
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
    const emptyKey = vers(Version.v740sp02, "EMPTY KEY");

    const key = seq("WITH",
                    opts(uniqueness),
                    altPrio(defaultKey, emptyKey,
                            seq(opts(alt("SORTED", "HASHED")),
                                "KEY",
                                alt(seq(Field, "COMPONENTS", pluss(FieldSub)),
                                    pluss(FieldSub)))));

    const normal1 = seq(opts(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                        "TABLE",
                        opts("OF"),
                        opts("REF TO"),
                        opts(TypeName));

    const likeType = seq(opts(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                         "TABLE OF",
                         optPrios("REF TO"),
                         opts(FieldChain),
                         opts(key),
                         opts(header));

    const range = seq("RANGE OF", TypeName);

    const typetable = seq(alt(normal1, range),
                          opts(pers(header, initial, plusPrios(key))));

    const occurs = seq("OCCURS", Integer);

    const old = seq(TypeName,
                    alt(seq(occurs, opts(header)), header));

    const ret = altPrio(
      seq("LIKE", alt(likeType, range)),
      seq("TYPE", alt(old, typetable)));

    return ret;
  }

}
