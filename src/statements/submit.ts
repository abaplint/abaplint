import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;
let alt = Combi.alt;
let plus = Combi.plus;

export class Submit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let eq = alt(str("="), str("EQ"), str("IN"), str("NE"));
    let awith = seq(str("WITH"), new Reuse.Field(), eq, new Reuse.Source());
    let prog = alt(new Reuse.Source(), new Reuse.Dynamic());
    let job = seq(str("VIA JOB"), new Reuse.Source(), str("NUMBER"), new Reuse.Source());
    let exporting = str("EXPORTING LIST TO MEMORY");
    let withTab = seq(str("WITH SELECTION-TABLE"), new Reuse.Source());
    let spool = seq(str("SPOOL PARAMETERS"), new Reuse.Source());
    let archive = seq(str("ARCHIVE PARAMETERS"), new Reuse.Source());
    let lineSize = seq(str("LINE-SIZE"), new Reuse.Source());
    let lineCount = seq(str("LINE-COUNT"), new Reuse.Source());

    let perm = per(plus(awith),
                   withTab,
                   spool,
                   lineSize,
                   lineCount,
                   archive,
                   str("TO SAP-SPOOL"),
                   str("WITHOUT SPOOL DYNPRO"),
                   str("VIA SELECTION-SCREEN"),
                   exporting,
                   str("AND RETURN"),
                   job);

    let ret = seq(str("SUBMIT"), prog, opt(perm));

    return ret;
  }

}