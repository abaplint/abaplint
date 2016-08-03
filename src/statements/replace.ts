import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Replace extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let option = alt(str("ALL OCCURRENCES"), str("FIRST OCCURRENCE"));

    return seq(str("REPLACE"),
               opt(option),
               opt(str("OF")),
               opt(str("REGEX")),
               Reuse.source(),
               opt(seq(str("IN"), Reuse.target())),
               str("WITH"),
               Reuse.source(),
               opt(seq(str("INTO"), Reuse.target())),
               opt(str("IGNORING CASE")));
  }

}