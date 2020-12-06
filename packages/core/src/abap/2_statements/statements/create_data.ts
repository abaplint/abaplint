import {IStatement} from "./_statement";
import {seq, alts, opts, pluss, vers} from "../combi";
import {Target, Source, Dynamic, Field, TypeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CreateData implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, similar to DATA or TYPES?
    const area = seq("AREA HANDLE", Source);

    const type = seq(alts("TYPE",
                          "TYPE REF TO",
                          "TYPE TABLE OF",
                          "TYPE TABLE OF REF TO",
                          "TYPE SORTED TABLE OF",
                          "TYPE HASHED TABLE OF",
                          "TYPE STANDARD TABLE OF",
                          "TYPE LINE OF"),
                     alts(TypeName, Dynamic));

    const like = seq(alts("LIKE",
                          "LIKE HASHED TABLE OF",
                          "LIKE LINE OF",
                          "LIKE STANDARD TABLE OF",
                          "LIKE SORTED TABLE OF",
                          "LIKE TABLE OF",
                          "TYPE HANDLE"),
                     alts(Source, Dynamic));

    const length = seq("LENGTH", Source);
    const initial = seq("INITIAL SIZE", Source);
    const decimals = seq("DECIMALS", Source);
    const uniq = alts("UNIQUE", "NON-UNIQUE");
    const emptyKey = vers(Version.v740sp02, "EMPTY KEY");
    const def = seq(opts(uniq), alts("DEFAULT KEY", emptyKey));

    const kdef = seq(opts(uniq), "KEY", alts(pluss(Field), Dynamic));

    const key = seq("WITH", alts(def, kdef));

    const ret = seq("CREATE DATA",
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