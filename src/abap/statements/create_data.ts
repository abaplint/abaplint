import {Statement} from "./statement";
import {str, seq, alt, opt, plus, IRunnable} from "../combi";
import {Target, Source, Dynamic, Field} from "../expressions";

export class CreateData extends Statement {

  public get_matcher(): IRunnable {
// todo, similar to DATA or TYPES?
    let area = seq(str("AREA HANDLE"), new Source());

    let type = alt(str("LIKE"),
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

    let length = seq(str("LENGTH"), new Source());
    let initial = seq(str("INITIAL SIZE"), new Source());
    let decimals = seq(str("DECIMALS"), new Source());
    let uniq = alt(str("UNIQUE"), str("NON-UNIQUE"));
    let def = seq(opt(uniq), str("DEFAULT KEY"));

    let kdef = seq(uniq, str("KEY"), alt(plus(new Field()), new Dynamic()));

    let key = seq(str("WITH"), alt(def, kdef));

    let ret = seq(str("CREATE DATA"),
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