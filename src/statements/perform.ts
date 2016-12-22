import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Perform extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let using = seq(str("USING"), plus(new Reuse.Source()));
    let tables = seq(str("TABLES"), plus(new Reuse.Source()));
    let changing = seq(str("CHANGING"), plus(new Reuse.Source()));

    return seq(str("PERFORM"),
               alt(new Reuse.FormName(), new Reuse.Dynamic()),
               opt(seq(str("IN PROGRAM"), alt(new Reuse.Dynamic(), opt(new Reuse.Field())))),
               opt(tables),
               opt(using),
               opt(changing),
               opt(str("IF FOUND")));
  }

}