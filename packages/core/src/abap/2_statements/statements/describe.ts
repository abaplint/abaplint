import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, per, altPrio} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Describe implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tlines = seq("LINES", Target);
    const kind = seq("KIND", Target);
    const occurs = seq("OCCURS", Target);

    const table = seq("TABLE",
                      Source,
                      opt(per(tlines, kind, occurs)));

    const mode = seq("IN", alt("BYTE", "CHARACTER"), "MODE");

    const field = seq("FIELD",
                      Source,
                      per(seq("TYPE", Target),
                          seq("COMPONENTS", Target),
                          seq("LENGTH", Target, opt(mode)),
                          seq("DECIMALS", Target),
                          seq("HELP-ID", Target),
                          seq("OUTPUT-LENGTH", Target),
                          seq("EDIT MASK", Target),
                          seq("INTO", Target)));

    const distance = seq("DISTANCE BETWEEN",
                         Source,
                         "AND",
                         Source,
                         "INTO",
                         Target,
                         mode);

    const lines = seq("NUMBER OF LINES", Target);
    const line = seq("LINE", Source);
    const page = seq("PAGE", Source);
    const index = seq("INDEX", Source);
    const top = seq("TOP-LINES", Target);
    const lineSize = seq("LINE-SIZE", Target);
    const first = seq("FIRST-LINE", Target);

    const list = seq("LIST", per(lines, index, line, page, top, first, lineSize));

    const ret = seq("DESCRIBE", altPrio(table, field, distance, list));

    return verNot(Version.Cloud, ret);
  }

}