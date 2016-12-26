import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class Convert extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let time = seq(str("TIME STAMP"),
                   new Reuse.Source(),
                   str("TIME ZONE"),
                   new Reuse.Source(),
                   str("INTO DATE"),
                   new Reuse.Target(),
                   str("TIME"),
                   new Reuse.Target(),
                   opt(seq(str("DAYLIGHT SAVING TIME"), new Reuse.Target())));

    let dat = seq(str("DATE"), new Reuse.Source());
    let tim = seq(str("TIME"), new Reuse.Source());

    let date = seq(per(dat, tim),
                   str("INTO TIME STAMP"),
                   new Reuse.Target(),
                   str("TIME ZONE"),
                   new Reuse.Source());

    return seq(str("CONVERT"), alt(time, date));
  }

}