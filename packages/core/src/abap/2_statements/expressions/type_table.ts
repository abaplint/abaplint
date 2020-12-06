import {seqs, opts, alts, str, ver, per, Expression, altPrios, plus, plusPrio, optPrios} from "../combi";
import {Constant, FieldSub, TypeName, Integer, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class TypeTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const header = str("WITH HEADER LINE");
    const initial = seqs("INITIAL SIZE", Constant);

    const uniqueness = alts("NON-UNIQUE", "UNIQUE");
    const defaultKey = str("DEFAULT KEY");
    const emptyKey = ver(Version.v740sp02, str("EMPTY KEY"));
//    const components = seq(str("COMPONENTS"), plus(new FieldSub()));
//    const named = seq(new Field(), opt(components));

    const key = seqs("WITH",
                     opts(uniqueness),
                     altPrios(defaultKey, emptyKey,
                              seqs(opts(alts("SORTED", "HASHED")),
                                   "KEY",
                                   alts(seqs(Field, "COMPONENTS", plus(new FieldSub())),
                                        plus(new FieldSub())))));

    const normal1 = seqs(opts(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                         "TABLE",
                         opts("OF"),
                         opts("REF TO"),
                         opts(TypeName));

    const likeType = seqs(opts(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                          "TABLE OF",
                          optPrios("REF TO"),
                          opts(FieldChain),
                          opts(key),
                          opts(header));

    const range = seqs("RANGE OF", TypeName);

    const typetable = seqs(alts(normal1, range),
                           opts(per(header, initial, plusPrio(key))));

    const occurs = seqs("OCCURS", Integer);

    const old = seqs(TypeName,
                     alts(seqs(occurs, opts(header)), header));

    const ret = altPrios(
      seqs("LIKE", alts(likeType, range)),
      seqs("TYPE", alts(old, typetable)));

    return ret;
  }

}
