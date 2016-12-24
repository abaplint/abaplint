import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, ParenRightW, ParenRight} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let tok = Combi.tok;
let plus = Combi.plus;

export class Perform extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let program = new Reuse.Field();
    let using = seq(str("USING"), plus(new Reuse.Source()));
    let tables = seq(str("TABLES"), plus(new Reuse.Source()));
    let changing = seq(str("CHANGING"), plus(new Reuse.Source()));

    let short = seq(new Reuse.FormName(),
                    tok(ParenLeft),
                    program,
                    alt(tok(ParenRightW), tok(ParenRight)));

    let full = seq(alt(new Reuse.FormName(), new Reuse.Dynamic()),
                   opt(seq(str("IN PROGRAM"), alt(new Reuse.Dynamic(), opt(program)))));

    return seq(str("PERFORM"),
               alt(short, full),
               opt(tables),
               opt(using),
               opt(changing),
               opt(str("IF FOUND")));
  }

}