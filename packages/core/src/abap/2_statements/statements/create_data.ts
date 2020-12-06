import {IStatement} from "./_statement";
import {str, seqs, alts, opts, pluss, ver} from "../combi";
import {Target, Source, Dynamic, Field, TypeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CreateData implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, similar to DATA or TYPES?
    const area = seqs("AREA HANDLE", Source);

    const type = seqs(alts("TYPE",
                           "TYPE REF TO",
                           "TYPE TABLE OF",
                           "TYPE TABLE OF REF TO",
                           "TYPE SORTED TABLE OF",
                           "TYPE HASHED TABLE OF",
                           "TYPE STANDARD TABLE OF",
                           "TYPE LINE OF"),
                      alts(TypeName, Dynamic));

    const like = seqs(alts("LIKE",
                           "LIKE HASHED TABLE OF",
                           "LIKE LINE OF",
                           "LIKE STANDARD TABLE OF",
                           "LIKE SORTED TABLE OF",
                           "LIKE TABLE OF",
                           "TYPE HANDLE"),
                      alts(Source, Dynamic));

    const length = seqs("LENGTH", Source);
    const initial = seqs("INITIAL SIZE", Source);
    const decimals = seqs("DECIMALS", Source);
    const uniq = alts("UNIQUE", "NON-UNIQUE");
    const emptyKey = ver(Version.v740sp02, str("EMPTY KEY"));
    const def = seqs(opts(uniq), alts("DEFAULT KEY", emptyKey));

    const kdef = seqs(opts(uniq), "KEY", alts(pluss(Field), Dynamic));

    const key = seqs("WITH", alts(def, kdef));

    const ret = seqs("CREATE DATA",
                     Target,
                     opts(area),
                     opts(alts(type, like)),
                     opts(key),
                     opts(initial),
                     opts(length),
                     opts(decimals));

    return ret;
  }

}