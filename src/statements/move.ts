import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Move extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let move = seq(alt(str("MOVE"), str("MOVE-CORRESPONDING")),
                   Reuse.source(),
                   str("TO"),
                   Reuse.target());

// todo, move ?= to CAST?
    let eq = seq(Reuse.target(), alt(str("="), str("?=")), Reuse.source());

    return alt(move, eq);
  }

}