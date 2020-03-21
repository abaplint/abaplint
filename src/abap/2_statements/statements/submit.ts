import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, alt, plus, IStatementRunnable, optPrio} from "../combi";
import {Source, NamespaceSimpleName, Dynamic, Field, AndReturn} from "../expressions";
import {Version} from "../../../version";

export class Submit extends Statement {

  public getMatcher(): IStatementRunnable {
    const sign = seq(str("SIGN"), new Source());
    const eq = alt(str("="), str("EQ"), str("IN"), str("NE"), str("CP"), str("GE"), str("LE"), str("INCL"));
    const compare = seq(eq, new Source());
    const between = seq(str("BETWEEN"), new Source(), str("AND"), new Source());
    const selectionTable = seq(str("WITH SELECTION-TABLE"), new Source());
    const awith = seq(str("WITH"), new Field(), alt(compare, between), optPrio(sign));
    const prog = alt(new NamespaceSimpleName(), new Dynamic());
    const job = seq(str("VIA JOB"), new Source(), str("NUMBER"), new Source());
    const exporting = str("EXPORTING LIST TO MEMORY");
    const spool = seq(str("SPOOL PARAMETERS"), new Source());
    const archive = seq(str("ARCHIVE PARAMETERS"), new Source());
    const lineSize = seq(str("LINE-SIZE"), new Source());
    const lineCount = seq(str("LINE-COUNT"), new Source());
    const user = seq(str("USER"), new Source());
    const sset = seq(str("USING SELECTION-SET"), new Source());
    const ssetp = seq(str("USING SELECTION-SETS OF PROGRAM"), new Source());
    const uss = seq(str("USING SELECTION-SCREEN"), new Source());
    const free = seq(str("WITH FREE SELECTIONS"), new Source());
    const newList = seq(str("NEW LIST IDENTIFICATION"), new Source());
    const layout = seq(str("LAYOUT"), new Source());
    const cover = seq(str("SAP COVER PAGE"), new Source());

    const keep = seq(str("KEEP IN SPOOL"), new Source());
    const imm = seq(str("IMMEDIATELY"), new Source());
    const dest = seq(str("DESTINATION"), new Source());
    const language = seq(str("LANGUAGE"), new Source());

    const perm = per(plus(awith),
                     selectionTable,
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
                     language,
                     free,
                     newList,
                     uss,
                     str("TO SAP-SPOOL"),
                     str("WITHOUT SPOOL DYNPRO"),
                     str("VIA SELECTION-SCREEN"),
                     exporting,
                     new AndReturn(),
                     job);

    const ret = seq(str("SUBMIT"), prog, opt(perm));

    return verNot(Version.Cloud, ret);
  }

}