import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class InsertInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(new Reuse.Source(), new Reuse.Dynamic());
    let assigning = seq(str("ASSIGNING"), new Reuse.FSTarget());
    let index = seq(str("INDEX"), new Reuse.Source());
    let initial = str("INITIAL LINE");

    let from = seq(str("FROM"),
                   new Reuse.Source(),
                   str("TO"),
                   new Reuse.Source());

    let foo = seq(str("INTO"),
                  opt(str("TABLE")),
                  new Reuse.Source(),
                  opt(index),
                  opt(assigning));

    let ret = seq(str("INSERT"),
                  alt(initial,
                      new Reuse.Target(),
                      seq(opt(str("LINES OF")),
                          target,
                          opt(from))),
                  alt(index, foo));

    return ret;
  }

}