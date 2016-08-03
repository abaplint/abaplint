import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SyntaxCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SYNTAX-CHECK FOR"),
                  Reuse.source(),
                  str("MESSAGE"),
                  Reuse.target(),
                  str("LINE"),
                  Reuse.target(),
                  str("WORD"),
                  Reuse.target(),
                  str("DIRECTORY ENTRY"),
                  Reuse.source());

    return ret;
  }

}