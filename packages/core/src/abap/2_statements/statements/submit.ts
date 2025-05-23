import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, optPrio, altPrio, per, plus} from "../combi";
import {Source, Dynamic, AndReturn, FieldSub, IncludeName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Submit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sign = seq("SIGN", Source);
    const eq = alt("=", "EQ", "IN", "NE", "CP", "GE", "LE", "INCL", "GT", "LT");
    const compare = seq(eq, Source);
    const between = seq("BETWEEN", Source, "AND", Source);
    const selectionTable = seq("WITH SELECTION-TABLE", Source);
    const awith = seq("WITH", FieldSub, alt(compare, between), optPrio(sign));
    const prog = altPrio(IncludeName, Dynamic);
    const job = seq("VIA JOB", Source, "NUMBER", Source);
    const exporting = str("EXPORTING LIST TO MEMORY");
    const spool = seq("SPOOL PARAMETERS", Source);
    const archive = seq("ARCHIVE PARAMETERS", Source);
    const lineSize = seq("LINE-SIZE", Source);
    const lineCount = seq("LINE-COUNT", Source);
    const user = seq("USER", Source);
    const sset = seq("USING SELECTION-SET", Source);
    const ssetp = seq("USING SELECTION-SETS OF PROGRAM", Source);
    const uss = seq("USING SELECTION-SCREEN", Source);
    const free = seq("WITH FREE SELECTIONS", Source);
    const newList = seq("NEW LIST IDENTIFICATION", Source);
    const layout = seq("LAYOUT", Source);
    const cover = seq("SAP COVER PAGE", Source);
    const copies = seq("COPIES", Source);
    const datasetExpiration = seq("DATASET EXPIRATION", Source);

    const keep = seq("KEEP IN SPOOL", Source);
    const imm = seq("IMMEDIATELY", Source);
    const dest = seq("DESTINATION", Source);
    const language = seq("LANGUAGE", Source);

    const perm = per(plus(awith),
                     selectionTable,
                     plus(awith),
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
                     copies,
                     datasetExpiration,
                     "TO SAP-SPOOL",
                     "WITHOUT SPOOL DYNPRO",
                     "VIA SELECTION-SCREEN",
                     exporting,
                     AndReturn,
                     job);

    const ret = seq("SUBMIT", prog, opt(perm));

    return verNot(Version.Cloud, ret);
  }

}