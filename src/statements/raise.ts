import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Raise extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let clas = seq(opt(str("RESUMABLE")),
                   str("EXCEPTION"),
                   opt(str("TYPE")),
                   new Reuse.Source(),
                   opt(seq(str("EXPORTING"), new Reuse.ParameterListS())));

    return seq(str("RAISE"), alt(new Reuse.Field(), clas));
  }

}