import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Describe extends Statement {

  public getMatcher(): IRunnable {
    let tlines = seq(str("LINES"), new Target());
    let kind = seq(str("KIND"), new Target());
    let occurs = seq(str("OCCURS"), new Target());

    let table = seq(str("TABLE"),
                    new Source(),
                    opt(per(tlines, kind, occurs)));

    let mode = seq(str("IN"), alt(str("BYTE"), str("CHARACTER")), str("MODE"));

    let field = seq(str("FIELD"),
                    new Source(),
                    per(seq(str("TYPE"), new Target()),
                        seq(str("COMPONENTS"), new Target()),
                        seq(str("LENGTH"), new Target(), opt(mode)),
                        seq(str("DECIMALS"), new Target()),
                        seq(str("HELP-ID"), new Target()),
                        seq(str("OUTPUT-LENGTH"), new Target()),
                        seq(str("EDIT MASK"), new Target()),
                        seq(str("INTO"), new Target())));

    let distance = seq(str("DISTANCE BETWEEN"),
                       new Source(),
                       str("AND"),
                       new Source(),
                       str("INTO"),
                       new Target(),
                       mode);

    let lines = seq(str("NUMBER OF LINES"), new Target());
    let line = seq(str("LINE"), new Source());
    let page = seq(str("PAGE"), new Source());
    let index = seq(str("INDEX"), new Target());
    let top = seq(str("TOP-LINES"), new Target());

    let list = seq(str("LIST"), per(lines, index, line, page, top));

    let ret = seq(str("DESCRIBE"), alt(table, field, distance, list));

    return verNot(Version.Cloud, ret);
  }

}