import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;
let optPrio = Combi.optPrio;

export class Program extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let message = seq(str("MESSAGE-ID"), new Reuse.Source());
    let size = seq(str("LINE-SIZE"), new Reuse.Source());
    let heading = str("NO STANDARD PAGE HEADING");
    let line = seq(str("LINE-SIZE"), new Reuse.Source());
    let options = per(message, size, heading, line);

    return seq(str("PROGRAM"), optPrio(new Reuse.Field()), opt(options));
  }

}