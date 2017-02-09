import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class DeleteTextpool extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let language = seq(str("LANGUAGE"), new Reuse.Source());

    return seq(str("DELETE TEXTPOOL"),
               new Reuse.Source(),
               opt(language));
  }

}