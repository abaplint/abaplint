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
    let sign = seq(str("SIGN"), new Reuse.Source());
    let eq = alt(str("="), str("EQ"), str("IN"), str("NE"), str("INCL"));
    let compare = seq(eq, new Reuse.Source());
    let between = seq(str("BETWEEN"), new Reuse.Source(), str("AND"), new Reuse.Source());
    let awith = seq(str("WITH"), new Reuse.Field(), alt(compare, between));
    let prog = alt(new Reuse.NamespaceSimpleName(), new Reuse.Dynamic());
    let job = seq(str("VIA JOB"), new Reuse.Source(), str("NUMBER"), new Reuse.Source());
    let exporting = str("EXPORTING LIST TO MEMORY");
    let withTab = seq(str("WITH SELECTION-TABLE"), new Reuse.Source());
    let spool = seq(str("SPOOL PARAMETERS"), new Reuse.Source());
    let archive = seq(str("ARCHIVE PARAMETERS"), new Reuse.Source());
    let lineSize = seq(str("LINE-SIZE"), new Reuse.Source());
    let lineCount = seq(str("LINE-COUNT"), new Reuse.Source());
    let user = seq(str("USER"), new Reuse.Source());
    let sset = seq(str("USING SELECTION-SET"), new Reuse.Source());
    let ssetp = seq(str("USING SELECTION-SETS OF PROGRAM"), new Reuse.Source());
    let uss = seq(str("USING SELECTION-SCREEN"), new Reuse.Source());
    let free = seq(str("WITH FREE SELECTIONS"), new Reuse.Source());

    let keep = seq(str("KEEP IN SPOOL"), new Reuse.Source());
    let imm = seq(str("IMMEDIATELY"), new Reuse.Source());
    let dest = seq(str("DESTINATION"), new Reuse.Source());

    let perm = per(plus(awith),
                   withTab,
                   spool,
                   lineSize,
                   lineCount,
                   archive,
                   user,
                   sset,
                   ssetp,
                   keep,
                   imm,
                   dest,
                   free,
                   sign,
                   uss,
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