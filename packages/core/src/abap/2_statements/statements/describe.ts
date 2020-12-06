import {IStatement} from "./_statement";
import {verNot, seqs, opt, alts, per, altPrio} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Describe implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tlines = seqs("LINES", Target);
    const kind = seqs("KIND", Target);
    const occurs = seqs("OCCURS", Target);

    const table = seqs("TABLE",
                       Source,
                       opt(per(tlines, kind, occurs)));

    const mode = seqs("IN", alts("BYTE", "CHARACTER"), "MODE");

    const field = seqs("FIELD",
                       Source,
                       per(seqs("TYPE", Target),
                           seqs("COMPONENTS", Target),
                           seqs("LENGTH", Target, opt(mode)),
                           seqs("DECIMALS", Target),
                           seqs("HELP-ID", Target),
                           seqs("OUTPUT-LENGTH", Target),
                           seqs("EDIT MASK", Target),
                           seqs("INTO", Target)));

    const distance = seqs("DISTANCE BETWEEN",
                          Source,
                          "AND",
                          Source,
                          "INTO",
                          Target,
                          mode);

    const lines = seqs("NUMBER OF LINES", Target);
    const line = seqs("LINE", Source);
    const page = seqs("PAGE", Source);
    const index = seqs("INDEX", Source);
    const top = seqs("TOP-LINES", Target);
    const lineSize = seqs("LINE-SIZE", Target);
    const first = seqs("FIRST-LINE", Target);

    const list = seqs("LIST", per(lines, index, line, page, top, first, lineSize));

    const ret = seqs("DESCRIBE", altPrio(table, field, distance, list));

    return verNot(Version.Cloud, ret);
  }

}