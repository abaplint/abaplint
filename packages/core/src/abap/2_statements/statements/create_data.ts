import {IStatement} from "./_statement";
import {str, seq, alt, opt, plus} from "../combi";
import {Target, Source, Dynamic, Field, TypeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CreateData implements IStatement {

  public getMatcher(): IStatementRunnable {
// todo, similar to DATA or TYPES?
    const area = seq(str("AREA HANDLE"), new Source());

    const type = seq(alt(str("TYPE"),
                         str("TYPE REF TO"),
                         str("TYPE TABLE OF"),
                         str("TYPE TABLE OF REF TO"),
                         str("TYPE SORTED TABLE OF"),
                         str("TYPE HASHED TABLE OF"),
                         str("TYPE STANDARD TABLE OF"),
                         str("TYPE LINE OF")),
                     alt(new TypeName(), new Dynamic()));

    const like = seq(alt(str("LIKE"),
                         str("LIKE HASHED TABLE OF"),
                         str("LIKE LINE OF"),
                         str("LIKE STANDARD TABLE OF"),
                         str("LIKE SORTED TABLE OF"),
                         str("LIKE TABLE OF"),
                         str("TYPE HANDLE")),
                     alt(new Source(), new Dynamic()));

    const length = seq(str("LENGTH"), new Source());
    const initial = seq(str("INITIAL SIZE"), new Source());
    const decimals = seq(str("DECIMALS"), new Source());
    const uniq = alt(str("UNIQUE"), str("NON-UNIQUE"));
    const def = seq(opt(uniq), str("DEFAULT KEY"));

    const kdef = seq(opt(uniq), str("KEY"), alt(plus(new Field()), new Dynamic()));

    const key = seq(str("WITH"), alt(def, kdef));

    const ret = seq(str("CREATE DATA"),
                    new Target(),
                    opt(area),
                    opt(alt(type, like)),
                    opt(key),
                    opt(initial),
                    opt(length),
                    opt(decimals));

    return ret;
  }

}