import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, per, optPrio, IRunnable} from "../combi";

export class Program extends Statement {

  public static get_matcher(): IRunnable {
    let message = seq(str("MESSAGE-ID"), new Reuse.Source());
    let size = seq(str("LINE-SIZE"), new Reuse.Source());
    let heading = str("NO STANDARD PAGE HEADING");
    let line = seq(str("LINE-SIZE"), new Reuse.Source());
    let options = per(message, size, heading, line);

    return seq(str("PROGRAM"), optPrio(new Reuse.Field()), opt(options));
  }

}