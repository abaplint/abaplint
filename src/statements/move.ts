import {Statement} from "./statement";
import {str, seq, alt, opt, plus, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Move extends Statement {

  public static get_matcher(): IRunnable {
    let keeping = str("KEEPING TARGET LINES");

    let move = seq(alt(seq(str("MOVE"), opt(str("EXACT"))),
                       str("MOVE-CORRESPONDING")),
                   new Source(),
                   alt(str("TO"), str("?TO")),
                   new Target(),
                   opt(keeping));

    let equals = alt(str("="), str("?="));

// todo, move ?= to CAST?
    let eq = seq(plus(seq(new Target(), equals)), new Source());

    return alt(move, eq);
  }

}