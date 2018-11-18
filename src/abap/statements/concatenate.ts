import {Statement} from "./_statement";
import {str, opt, seq, alt, per, plus, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Concatenate extends Statement {

  public getMatcher(): IRunnable {
    const mode = seq(str("IN"),
                     alt(str("BYTE"), str("CHARACTER")),
                     str("MODE"));
    const blanks = str("RESPECTING BLANKS");
    const sep = seq(str("SEPARATED BY"), new Source());

    const options = per(mode, blanks, sep);

    return seq(str("CONCATENATE"),
               new Source(),
               plus(new Source()),
               str("INTO"),
               new Target(),
               opt(options));
  }

}