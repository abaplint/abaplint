import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Move extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let move = seq(alt(str("MOVE"), str("MOVE-CORRESPONDING")),
                   new Reuse.Source(),
                   str("TO"),
                   new Reuse.Target());

// todo, move ?= to CAST?
    let eq = seq(new Reuse.Target(), alt(str("="), str("?=")), new Reuse.Source());

    return alt(move, eq);
  }

}