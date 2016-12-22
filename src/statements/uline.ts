import { Statement } from "./statement";
import * as Combi from "../combi";
import {ParenLeft, ParenRight} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let tok = Combi.tok;
let reg = Combi.regex;

export class Uline extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let pos = seq(str("/"), opt(seq(tok(ParenLeft), reg(/^\d+$/), tok(ParenRight))));

    return seq(str("ULINE"), opt(pos));
  }

}