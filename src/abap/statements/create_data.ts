import {Statement} from "./_statement";
import {str, seq, alt, opt, plus, IStatementRunnable} from "../combi";
import {Target, Source, Dynamic, Field} from "../expressions";

export class CreateData extends Statement {

  public getMatcher(): IStatementRunnable {
// todo, similar to DATA or TYPES?
    const area = seq(str("AREA HANDLE"), new Source());

    const type = alt(str("LIKE"),
                     str("TYPE"),
                     str("TYPE HANDLE"),
                     str("TYPE REF TO"),
                     str("LIKE TABLE OF"),
                     str("TYPE TABLE OF"),
                     str("TYPE SORTED TABLE OF"),
                     str("LIKE SORTED TABLE OF"),
                     str("LIKE HASHED TABLE OF"),
                     str("TYPE HASHED TABLE OF"),
                     str("TYPE STANDARD TABLE OF"),
                     str("LIKE STANDARD TABLE OF"),
                     str("LIKE LINE OF"),
                     str("TYPE LINE OF"));

    const length = seq(str("LENGTH"), new Source());
    const initial = seq(str("INITIAL SIZE"), new Source());
    const decimals = seq(str("DECIMALS"), new Source());
    const uniq = alt(str("UNIQUE"), str("NON-UNIQUE"));
    const def = seq(opt(uniq), str("DEFAULT KEY"));

    const kdef = seq(uniq, str("KEY"), alt(plus(new Field()), new Dynamic()));

    const key = seq(str("WITH"), alt(def, kdef));

    const ret = seq(str("CREATE DATA"),
                    new Target(),
                    opt(area),
                    opt(seq(type, alt(new Source(), new Dynamic()))),
                    opt(key),
                    opt(initial),
                    opt(length),
                    opt(decimals));

    return ret;
  }

}