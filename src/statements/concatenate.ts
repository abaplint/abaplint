import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, opt, seq, alt, per, plus, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Concatenate extends Statement {

  public static get_matcher(): IRunnable {
    let mode = seq(str("IN"),
                   alt(str("BYTE"), str("CHARACTER")),
                   str("MODE"));
    let blanks = str("RESPECTING BLANKS");
    let sep = seq(str("SEPARATED BY"), new Reuse.Source());

    let options = per(mode, blanks, sep);

    return seq(str("CONCATENATE"),
               new Reuse.Source(),
               plus(new Reuse.Source()),
               str("INTO"),
               new Target(),
               opt(options));
  }

}