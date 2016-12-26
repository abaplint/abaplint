import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class AuthorityCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let field = seq(str("FIELD"), new Reuse.Source());

    let id = seq(str("ID"),
                 new Reuse.Source(),
                 alt(field, str("DUMMY")));

    let ret = seq(str("AUTHORITY-CHECK OBJECT"),
                  new Reuse.Source(),
                  opt(seq(str("FOR USER"), new Reuse.Source())),
                  plus(id));

    return ret;
  }

}