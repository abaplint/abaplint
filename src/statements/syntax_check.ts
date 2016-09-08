import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SyntaxCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SYNTAX-CHECK FOR"),
                  new Reuse.Source(),
                  str("MESSAGE"),
                  new Reuse.Target(),
                  str("LINE"),
                  new Reuse.Target(),
                  str("WORD"),
                  new Reuse.Target(),
                  str("DIRECTORY ENTRY"),
                  new Reuse.Source());

    return ret;
  }

}