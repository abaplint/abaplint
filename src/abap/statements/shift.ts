import {Statement} from "./_statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Shift extends Statement {

  public getMatcher(): IRunnable {
    let deleting = seq(str("DELETING"), alt(str("LEADING"), str("TRAILING")), new Source());
    let up = seq(str("UP TO"), new Source());
    let mode = seq(str("IN"), alt(str("CHARACTER"), str("BYTE")), str("MODE"));
    let dir = alt(str("LEFT"), str("RIGHT"));
    let by = seq(str("BY"), new Source(), opt(str("PLACES")));

    let options = per(deleting, up, mode, dir, by, str("CIRCULAR"));

    return seq(str("SHIFT"),
               new Target(),
               opt(options));
  }

}