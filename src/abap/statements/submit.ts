import {Statement} from "./statement";
import {verNot, str, seq, opt, per, alt, plus, IRunnable} from "../combi";
import {Source, NamespaceSimpleName, Dynamic, Field} from "../expressions";
import {Version} from "../../version";

export class Submit extends Statement {

  public getMatcher(): IRunnable {
    let sign = seq(str("SIGN"), new Source());
    let eq = alt(str("="), str("EQ"), str("IN"), str("NE"), str("CP"), str("GE"), str("LE"), str("INCL"));
    let compare = seq(eq, new Source());
    let between = seq(str("BETWEEN"), new Source(), str("AND"), new Source());
    let selectionTable = seq(str("SELECTION-TABLE"), new Source());
    let awith = seq(str("WITH"), alt(seq(new Field(), alt(compare, between)), selectionTable));
    let prog = alt(new NamespaceSimpleName(), new Dynamic());
    let job = seq(str("VIA JOB"), new Source(), str("NUMBER"), new Source());
    let exporting = str("EXPORTING LIST TO MEMORY");
    let spool = seq(str("SPOOL PARAMETERS"), new Source());
    let archive = seq(str("ARCHIVE PARAMETERS"), new Source());
    let lineSize = seq(str("LINE-SIZE"), new Source());
    let lineCount = seq(str("LINE-COUNT"), new Source());
    let user = seq(str("USER"), new Source());
    let sset = seq(str("USING SELECTION-SET"), new Source());
    let ssetp = seq(str("USING SELECTION-SETS OF PROGRAM"), new Source());
    let uss = seq(str("USING SELECTION-SCREEN"), new Source());
    let free = seq(str("WITH FREE SELECTIONS"), new Source());
    let newList = seq(str("NEW LIST IDENTIFICATION"), new Source());
    let layout = seq(str("LAYOUT"), new Source());
    let cover = seq(str("SAP COVER PAGE"), new Source());

    let keep = seq(str("KEEP IN SPOOL"), new Source());
    let imm = seq(str("IMMEDIATELY"), new Source());
    let dest = seq(str("DESTINATION"), new Source());

    let perm = per(plus(awith),
                   spool,
                   lineSize,
                   lineCount,
                   archive,
                   user,
                   sset,
                   ssetp,
                   keep,
                   cover,
                   imm,
                   layout,
                   dest,
                   free,
                   newList,
                   sign,
                   uss,
                   str("TO SAP-SPOOL"),
                   str("WITHOUT SPOOL DYNPRO"),
                   str("VIA SELECTION-SCREEN"),
                   exporting,
                   str("AND RETURN"),
                   job);

    let ret = seq(str("SUBMIT"), prog, opt(perm));

    return verNot(Version.Cloud, ret);
  }

}