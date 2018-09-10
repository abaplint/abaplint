import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, per, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Describe extends Statement {

  public static get_matcher(): IRunnable {
    let tlines = seq(str("LINES"), new Target());
    let kind = seq(str("KIND"), new Target());

    let table = seq(str("TABLE"),
                    new Reuse.Source(),
                    opt(per(tlines, kind)));

    let mode = seq(str("IN"), alt(str("BYTE"), str("CHARACTER")), str("MODE"));

    let field = seq(str("FIELD"),
                    new Reuse.Source(),
                    per(seq(str("TYPE"), new Target()),
                        seq(str("COMPONENTS"), new Target()),
                        seq(str("LENGTH"), new Target(), opt(mode)),
                        seq(str("DECIMALS"), new Target()),
                        seq(str("HELP-ID"), new Target()),
                        seq(str("OUTPUT-LENGTH"), new Target()),
                        seq(str("EDIT MASK"), new Target()),
                        seq(str("INTO"), new Target())));

    let distance = seq(str("DISTANCE BETWEEN"),
                       new Reuse.Source(),
                       str("AND"),
                       new Reuse.Source(),
                       str("INTO"),
                       new Target(),
                       mode);

    let lines = seq(str("NUMBER OF LINES"), new Target());
    let line = seq(str("LINE"), new Reuse.Source());
    let page = seq(str("PAGE"), new Reuse.Source());
    let index = seq(str("INDEX"), new Target());
    let top = seq(str("TOP-LINES"), new Target());

    let list = seq(str("LIST"), per(lines, index, line, page, top));

    return seq(str("DESCRIBE"), alt(table, field, distance, list));
  }

}