import {seqs, opt, alt, str, ver, per, Expression, altPrio, plus, plusPrio, optPrio} from "../combi";
import {Constant, FieldSub, TypeName, Integer, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class TypeTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const header = str("WITH HEADER LINE");
    const initial = seqs("INITIAL SIZE", Constant);

    const uniqueness = alt(str("NON-UNIQUE"), str("UNIQUE"));
    const defaultKey = str("DEFAULT KEY");
    const emptyKey = ver(Version.v740sp02, str("EMPTY KEY"));
//    const components = seq(str("COMPONENTS"), plus(new FieldSub()));
//    const named = seq(new Field(), opt(components));

    const key = seqs("WITH",
                     opt(uniqueness),
                     altPrio(defaultKey, emptyKey,
                             seqs(opt(alt(str("SORTED"), str("HASHED"))),
                                  "KEY",
                                  alt(seqs(Field, "COMPONENTS", plus(new FieldSub())),
                                      plus(new FieldSub())))));

    const normal1 = seqs(opt(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY"))),
                         "TABLE",
                         opt(str("OF")),
                         opt(str("REF TO")),
                         opt(new TypeName()));

    const likeType = seqs(opt(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY"))),
                          "TABLE OF",
                          optPrio(str("REF TO")),
                          opt(new FieldChain()),
                          opt(key),
                          opt(header));

    const range = seqs("RANGE OF", TypeName);

    const typetable = seqs(alt(normal1, range),
                           opt(per(header, initial, plusPrio(key))));

    const occurs = seqs("OCCURS", Integer);

    const old = seqs(TypeName,
                     alt(seqs(occurs, opt(header)),
                         header));

    const ret = altPrio(
      seqs("LIKE", alt(likeType, range)),
      seqs("TYPE", alt(old, typetable)));

    return ret;
  }

}
