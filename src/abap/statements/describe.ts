import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Describe extends Statement {

  public getMatcher(): IStatementRunnable {
    const tlines = seq(str("LINES"), new Target());
    const kind = seq(str("KIND"), new Target());
    const occurs = seq(str("OCCURS"), new Target());

    const table = seq(str("TABLE"),
                      new Source(),
                      opt(per(tlines, kind, occurs)));

    const mode = seq(str("IN"), alt(str("BYTE"), str("CHARACTER")), str("MODE"));

    const field = seq(str("FIELD"),
                      new Source(),
                      per(seq(str("TYPE"), new Target()),
                          seq(str("COMPONENTS"), new Target()),
                          seq(str("LENGTH"), new Target(), opt(mode)),
                          seq(str("DECIMALS"), new Target()),
                          seq(str("HELP-ID"), new Target()),
                          seq(str("OUTPUT-LENGTH"), new Target()),
                          seq(str("EDIT MASK"), new Target()),
                          seq(str("INTO"), new Target())));

    const distance = seq(str("DISTANCE BETWEEN"),
                         new Source(),
                         str("AND"),
                         new Source(),
                         str("INTO"),
                         new Target(),
                         mode);

    const lines = seq(str("NUMBER OF LINES"), new Target());
    const line = seq(str("LINE"), new Source());
    const page = seq(str("PAGE"), new Source());
    const index = seq(str("INDEX"), new Target());
    const top = seq(str("TOP-LINES"), new Target());

    const list = seq(str("LIST"), per(lines, index, line, page, top));

    const ret = seq(str("DESCRIBE"), alt(table, field, distance, list));

    return verNot(Version.Cloud, ret);
  }

}