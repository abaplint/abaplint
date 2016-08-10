import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Perform extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let using = seq(str("USING"), plus(Reuse.source()));
    let tables = seq(str("TABLES"), plus(Reuse.source()));
    let changing = seq(str("CHANGING"), plus(Reuse.source()));

    return seq(str("PERFORM"),
               alt(Reuse.form_name(), Reuse.dynamic()),
               opt(seq(str("IN PROGRAM"), opt(Reuse.field()))),
               opt(str("IF FOUND")),
               opt(tables),
               opt(using),
               opt(changing));
  }

}