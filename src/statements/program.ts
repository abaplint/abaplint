import {Statement} from "./statement";
import {str, seq, opt, per, optPrio, IRunnable} from "../combi";
import {Source, Field} from "../expressions";

export class Program extends Statement {

  public static get_matcher(): IRunnable {
    let message = seq(str("MESSAGE-ID"), new Source());
    let size = seq(str("LINE-SIZE"), new Source());
    let heading = str("NO STANDARD PAGE HEADING");
    let line = seq(str("LINE-SIZE"), new Source());
    let options = per(message, size, heading, line);

    return seq(str("PROGRAM"), optPrio(new Field()), opt(options));
  }

}