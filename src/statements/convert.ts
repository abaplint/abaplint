import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Convert extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let time = seq(str("TIME STAMP"),
                   Reuse.source(),
                   str("TIME ZONE"),
                   Reuse.source(),
                   str("INTO DATE"),
                   Reuse.target(),
                   str("TIME"),
                   Reuse.target(),
                   opt(seq(str("DAYLIGHT SAVING TIME"), Reuse.target())));

    let date = seq(str("DATE"),
                   Reuse.source(),
                   str("TIME"),
                   Reuse.source(),
                   str("INTO TIME STAMP"),
                   Reuse.target(),
                   str("TIME ZONE"),
                   Reuse.source());

    return seq(str("CONVERT"), alt(time, date));
  }

}