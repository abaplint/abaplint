import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, per, alts, plus, optPrio} from "../combi";
import {Source, NamespaceSimpleName, Dynamic, Field, AndReturn} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Submit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sign = seqs("SIGN", Source);
    const eq = alts("=", "EQ", "IN", "NE", "CP", "GE", "LE", "INCL");
    const compare = seqs(eq, Source);
    const between = seqs("BETWEEN", Source, "AND", Source);
    const selectionTable = seqs("WITH SELECTION-TABLE", Source);
    const awith = seqs("WITH", Field, alts(compare, between), optPrio(sign));
    const prog = alts(NamespaceSimpleName, Dynamic);
    const job = seqs("VIA JOB", Source, "NUMBER", Source);
    const exporting = str("EXPORTING LIST TO MEMORY");
    const spool = seqs("SPOOL PARAMETERS", Source);
    const archive = seqs("ARCHIVE PARAMETERS", Source);
    const lineSize = seqs("LINE-SIZE", Source);
    const lineCount = seqs("LINE-COUNT", Source);
    const user = seqs("USER", Source);
    const sset = seqs("USING SELECTION-SET", Source);
    const ssetp = seqs("USING SELECTION-SETS OF PROGRAM", Source);
    const uss = seqs("USING SELECTION-SCREEN", Source);
    const free = seqs("WITH FREE SELECTIONS", Source);
    const newList = seqs("NEW LIST IDENTIFICATION", Source);
    const layout = seqs("LAYOUT", Source);
    const cover = seqs("SAP COVER PAGE", Source);

    const keep = seqs("KEEP IN SPOOL", Source);
    const imm = seqs("IMMEDIATELY", Source);
    const dest = seqs("DESTINATION", Source);
    const language = seqs("LANGUAGE", Source);

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

    const ret = seqs("SUBMIT", prog, opts(perm));

    return verNot(Version.Cloud, ret);
  }

}