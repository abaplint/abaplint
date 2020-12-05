import {IStatement} from "./_statement";
import {str, seqs, alt, opt, plus, ver} from "../combi";
import {Target, Source, Dynamic, Field, TypeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CreateData implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, similar to DATA or TYPES?
    const area = seqs("AREA HANDLE", Source);

    const type = seqs(alt(str("TYPE"),
                          str("TYPE REF TO"),
                          str("TYPE TABLE OF"),
                          str("TYPE TABLE OF REF TO"),
                          str("TYPE SORTED TABLE OF"),
                          str("TYPE HASHED TABLE OF"),
                          str("TYPE STANDARD TABLE OF"),
                          str("TYPE LINE OF")),
                      alt(new TypeName(), new Dynamic()));

    const like = seqs(alt(str("LIKE"),
                          str("LIKE HASHED TABLE OF"),
                          str("LIKE LINE OF"),
                          str("LIKE STANDARD TABLE OF"),
                          str("LIKE SORTED TABLE OF"),
                          str("LIKE TABLE OF"),
                          str("TYPE HANDLE")),
                      alt(new Source(), new Dynamic()));

    const length = seqs("LENGTH", Source);
    const initial = seqs("INITIAL SIZE", Source);
    const decimals = seqs("DECIMALS", Source);
    const uniq = alt(str("UNIQUE"), str("NON-UNIQUE"));
    const emptyKey = ver(Version.v740sp02, str("EMPTY KEY"));
    const def = seqs(opt(uniq), alt(str("DEFAULT KEY"), emptyKey));

    const kdef = seqs(opt(uniq), "KEY", alt(plus(new Field()), new Dynamic()));

    const key = seqs("WITH", alt(def, kdef));

    const ret = seqs("CREATE DATA",
                     Target,
                     opt(area),
                     opt(alt(type, like)),
                     opt(key),
                     opt(initial),
                     opt(length),
                     opt(decimals));

    return ret;
  }

}