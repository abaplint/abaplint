import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let per = Combi.per;

export class ReadTextpool extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let language = seq(str("LANGUAGE"), new Reuse.Source());
    let into = seq(str("INTO"), new Reuse.Target());
    let state = seq(str("STATE"), new Reuse.Source());

    return seq(str("READ TEXTPOOL"),
               new Reuse.Source(),
               per(into, language, state));
  }

}