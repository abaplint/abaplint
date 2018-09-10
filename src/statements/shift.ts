import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Shift extends Statement {

  public static get_matcher(): IRunnable {
    let deleting = seq(str("DELETING"), alt(str("LEADING"), str("TRAILING")), new Reuse.Source());
    let up = seq(str("UP TO"), new Reuse.Source());
    let mode = seq(str("IN"), alt(str("CHARACTER"), str("BYTE")), str("MODE"));
    let dir = alt(str("LEFT"), str("RIGHT"));
    let by = seq(str("BY"), new Reuse.Source(), opt(str("PLACES")));

    let options = per(deleting, up, mode, dir, by, str("CIRCULAR"));

    return seq(str("SHIFT"),
               new Target(),
               opt(options));
  }

}