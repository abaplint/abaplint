import {Statement} from "./statement";
import {str, per, alt, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Format extends Statement {

  public static get_matcher(): IRunnable {
    let eq = seq(str("="), new Source());
    let value = alt(eq, new Source());
    let toggle = alt(str("ON"), str("OFF"));

    let options = per(str("RESET"),
                      seq(str("INTENSIFIED"), opt(value)),
                      seq(str("INVERSE"), opt(value)),
                      seq(str("HOTSPOT"), opt(value)),
                      seq(str("FRAMES"), value),
                      seq(str("INPUT"), value),
                      seq(str("COLOR"), value, opt(toggle)));
    return seq(str("FORMAT"), options);
  }

}