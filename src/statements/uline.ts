import {Statement} from "./statement";
import * as Combi from "../combi";
import {ParenLeft, ParenRight, WParenLeft} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let tok = Combi.tok;
let alt = Combi.alt;
let reg = Combi.regex;

export class Uline extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let pos = alt(seq(str("/"), opt(seq(tok(ParenLeft), reg(/^\d+$/), tok(ParenRight)))),
                  seq(tok(WParenLeft), reg(/^\d+$/), tok(ParenRight)));

    return seq(str("ULINE"), opt(pos));
  }

}