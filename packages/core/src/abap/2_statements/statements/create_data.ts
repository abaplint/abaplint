import {IStatement} from "./_statement";
import {seq, alt, opt, plus, vers} from "../combi";
import {Target, Source, Dynamic, Field, TypeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CreateData implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, similar to DATA or TYPES?
    const area = seq("AREA HANDLE", Source);

    const type = seq(alt("TYPE",
                         "TYPE REF TO",
                         "TYPE TABLE OF",
                         "TYPE TABLE OF REF TO",
                         "TYPE SORTED TABLE OF",
                         "TYPE HASHED TABLE OF",
                         "TYPE STANDARD TABLE OF",
                         "TYPE LINE OF"),
                     alt(TypeName, Dynamic));

    const like = seq(alt("LIKE",
                         "LIKE HASHED TABLE OF",
                         "LIKE LINE OF",
                         "LIKE STANDARD TABLE OF",
                         "LIKE SORTED TABLE OF",
                         "LIKE TABLE OF",
                         "TYPE HANDLE"),
                     alt(Source, Dynamic));

    const length = seq("LENGTH", Source);
    const initial = seq("INITIAL SIZE", Source);
    const decimals = seq("DECIMALS", Source);
    const uniq = alt("UNIQUE", "NON-UNIQUE");
    const emptyKey = vers(Version.v740sp02, "EMPTY KEY");
    const def = seq(opt(uniq), alt("DEFAULT KEY", emptyKey));

    const kdef = seq(opt(uniq), "KEY", alt(plus(Field), Dynamic));

    const key = seq("WITH", alt(def, kdef));

    const ret = seq("CREATE DATA",
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