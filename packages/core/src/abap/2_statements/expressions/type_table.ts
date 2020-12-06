import {seqs, opt, alts, str, ver, per, Expression, altPrio, plus, plusPrio, optPrio} from "../combi";
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
                     opt(uniqueness),
                     altPrio(defaultKey, emptyKey,
                             seqs(opt(alts("SORTED", "HASHED")),
                                  "KEY",
                                  alts(seqs(Field, "COMPONENTS", plus(new FieldSub())),
                                       plus(new FieldSub())))));

    const normal1 = seqs(opt(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                         "TABLE",
                         opt(str("OF")),
                         opt(str("REF TO")),
                         opt(new TypeName()));

    const likeType = seqs(opt(alts("STANDARD", "HASHED", "INDEX", "SORTED", "ANY")),
                          "TABLE OF",
                          optPrio(str("REF TO")),
                          opt(new FieldChain()),
                          opt(key),
                          opt(header));

    const range = seqs("RANGE OF", TypeName);

    const typetable = seqs(alts(normal1, range),
                           opt(per(header, initial, plusPrio(key))));

    const occurs = seqs("OCCURS", Integer);

    const old = seqs(TypeName,
                     alts(seqs(occurs, opt(header)), header));

    const ret = altPrio(
      seqs("LIKE", alts(likeType, range)),
      seqs("TYPE", alts(old, typetable)));

    return ret;
  }

}
