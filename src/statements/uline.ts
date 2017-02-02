import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, ParenRight, WParenLeft, ParenRightW} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let tok = Combi.tok;
let alt = Combi.alt;
let reg = Combi.regex;
let optPrio = Combi.optPrio;

export class Uline extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let right = alt(tok(ParenRight), tok(ParenRightW));

    let pos = alt(seq(reg(/^(\/\d*|\d+)$/),
                      opt(seq(tok(ParenLeft), reg(/^\d+$/), right))),
                  seq(tok(WParenLeft), reg(/^\d+$/), right));

    return seq(str("ULINE"), optPrio(str("AT")), opt(alt(pos, new Reuse.Dynamic())));
  }

}