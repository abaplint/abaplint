import {Statement} from "./statement";
import {str, opt, seq, alt, per, plus, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Concatenate extends Statement {

  public getMatcher(): IRunnable {
    let mode = seq(str("IN"),
                   alt(str("BYTE"), str("CHARACTER")),
                   str("MODE"));
    let blanks = str("RESPECTING BLANKS");
    let sep = seq(str("SEPARATED BY"), new Source());

    let options = per(mode, blanks, sep);

    return seq(str("CONCATENATE"),
               new Source(),
               plus(new Source()),
               str("INTO"),
               new Target(),
               opt(options));
  }

}