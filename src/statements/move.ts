import {Statement} from "./statement";
import {str, seq, alt, opt, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Target} from "../expressions";

export class Move extends Statement {

  public static get_matcher(): IRunnable {
    let keeping = str("KEEPING TARGET LINES");

    let move = seq(alt(seq(str("MOVE"), opt(str("EXACT"))),
                       str("MOVE-CORRESPONDING")),
                   new Reuse.Source(),
                   alt(str("TO"), str("?TO")),
                   new Target(),
                   opt(keeping));

    let equals = alt(str("="), str("?="));

// todo, move ?= to CAST?
    let eq = seq(plus(seq(new Target(), equals)), new Reuse.Source());

    return alt(move, eq);
  }

}