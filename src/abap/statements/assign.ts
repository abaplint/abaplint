import {Statement} from "./_statement";
import {str, seq, alt, opt, tok, per, IRunnable} from "../combi";
import {Arrow} from "../tokens/";
import {FSTarget, Target, Source, Dynamic, Field, FieldSub} from "../expressions";

export class Assign extends Statement {

  public getMatcher(): IRunnable {
    const component = seq(str("COMPONENT"),
                          new Source(),
                          str("OF STRUCTURE"),
                          new Source());

    const tableField = seq(str("TABLE FIELD"), new Dynamic());

    const source = alt(seq(new Source(), opt(seq(tok(Arrow), new Dynamic()))),
                       component,
                       tableField,
                       seq(new Dynamic(), opt(seq(tok(Arrow), alt(new Field(), new Dynamic())))));

    const type = seq(str("TYPE"), alt(new Dynamic(), new Source()));
    const like = seq(str("LIKE"), alt(new Dynamic(), new Source()));
    const handle = seq(str("TYPE HANDLE"), new Source());
    const range = seq(str("RANGE"), new FieldSub());
    const decimals = seq(str("DECIMALS"), new Source());

    const casting = seq(opt(str("CASTING")), opt(alt(like, range, handle, per(type, decimals))));

    const ret = seq(str("ASSIGN"),
                    opt(seq(new Target(), str("INCREMENT"))),
                    source,
                    str("TO"),
                    new FSTarget(),
                    casting,
                    opt(range));

    return ret;
  }

}