import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let per = Combi.per;

export class InsertInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(new Reuse.Source(), new Reuse.Dynamic());
    let assigning = seq(str("ASSIGNING"), new Reuse.FSTarget());
    let ref = seq(str("REFERENCE INTO"), new Reuse.Target());
    let index = seq(str("INDEX"), new Reuse.Source());
    let initial = str("INITIAL LINE");
    let into = seq(str("INTO"), opt(str("TABLE")), new Reuse.Source());

    let to = seq(str("TO"), new Reuse.Source());

    let from = seq(str("FROM"),
                   new Reuse.Source(),
                   opt(to));

    let foo = per(into,
                  ref,
                  index,
                  assigning);

    let lines = seq(opt(str("LINES OF")),
                    target,
                    opt(from));

    let ret = seq(str("INSERT"),
                  alt(initial,
                      new Reuse.Target(),
                      lines),
                  foo);

    return ret;
  }

}