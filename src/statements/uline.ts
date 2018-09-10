import {Statement} from "./statement";
import {str, seq, opt, tok, alt, regex as reg, optPrio, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, ParenRight, WParenLeft, ParenRightW} from "../tokens/";

export class Uline extends Statement {

  public static get_matcher(): IRunnable {
    let right = alt(tok(ParenRight), tok(ParenRightW));

    let pos = alt(seq(reg(/^(\/\d*|\d+)$/),
                      opt(seq(tok(ParenLeft), reg(/^\d+$/), right))),
                  seq(tok(WParenLeft), reg(/^\d+$/), right));

    return seq(str("ULINE"), optPrio(str("AT")), opt(alt(pos, new Reuse.Dynamic())));
  }

}