import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class Describe extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let tlines = seq(str("LINES"), new Reuse.Target());
    let kind = seq(str("KIND"), new Reuse.Target());

    let table = seq(str("TABLE"),
                    new Reuse.Source(),
                    opt(per(tlines, kind)));

    let mode = seq(str("IN"), alt(str("BYTE"), str("CHARACTER")), str("MODE"));

    let field = seq(str("FIELD"),
                    new Reuse.Source(),
                    per(seq(str("TYPE"), new Reuse.Target()),
                        seq(str("COMPONENTS"), new Reuse.Target()),
                        seq(str("LENGTH"), new Reuse.Target(), opt(mode)),
                        seq(str("DECIMALS"), new Reuse.Target()),
                        seq(str("HELP-ID"), new Reuse.Target()),
                        seq(str("OUTPUT-LENGTH"), new Reuse.Target()),
                        seq(str("EDIT MASK"), new Reuse.Target()),
                        seq(str("INTO"), new Reuse.Target())));

    let distance = seq(str("DISTANCE BETWEEN"),
                       new Reuse.Source(),
                       str("AND"),
                       new Reuse.Source(),
                       str("INTO"),
                       new Reuse.Target(),
                       mode);

    let lines = seq(str("NUMBER OF LINES"), new Reuse.Target());
    let line = seq(str("LINE"), new Reuse.Source());
    let page = seq(str("PAGE"), new Reuse.Source());
    let index = seq(str("INDEX"), new Reuse.Target());
    let top = seq(str("TOP-LINES"), new Reuse.Target());

    let list = seq(str("LIST"), per(lines, index, line, page, top));

    return seq(str("DESCRIBE"), alt(table, field, distance, list));
  }

}