import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class GenerateSubroutine extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("GENERATE SUBROUTINE POOL"),
                  new Reuse.Source(),
                  str("NAME"),
                  new Reuse.Source(),
                  str("MESSAGE"),
                  new Reuse.Target(),
                  str("LINE"),
                  new Reuse.Target());

    return ret;
  }

}