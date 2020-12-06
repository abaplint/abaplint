import {seq, opts, alts, vers, pers, Expression, altPrios, pluss, plusPrios, optPrios} from "../combi";
import {Constant, FieldSub, TypeName, Integer, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class TypeTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const header = "WITH HEADER LINE";
    const initial = seq("INITIAL SIZE", Constant);

    const uniqueness = alts("NON-UNIQUE", "UNIQUE");
    const defaultKey = "DEFAULT KEY";
    const emptyKey = vers(Version.v740sp02, "EMPTY KEY");

    const key = seq("WITH",
                    opts(uniqueness),
                    altPrios(defaultKey, emptyKey,
                             seq(opts(alts("SORTED", "HASHED")),
                                 "KEY",
                                 alts(seq(Field, "COMPONENTS", pluss(FieldSub)),
                                      pluss(FieldSub)))));

    const normal1 = seq(opts(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                        "TABLE",
                        opts("OF"),
                        opts("REF TO"),
                        opts(TypeName));

    const likeType = seq(opts(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                         "TABLE OF",
                         optPrios("REF TO"),
                         opts(FieldChain),
                         opts(key),
                         opts(header));

    const range = seq("RANGE OF", TypeName);

    const typetable = seq(alts(normal1, range),
                          opts(pers(header, initial, plusPrios(key))));

    const occurs = seq("OCCURS", Integer);

    const old = seq(TypeName,
                    alts(seq(occurs, opts(header)), header));

    const ret = altPrios(
      seq("LIKE", alts(likeType, range)),
      seq("TYPE", alts(old, typetable)));

    return ret;
  }

}
