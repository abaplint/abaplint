import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Leave extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("LEAVE"),
               alt(str("TO CURRENT TRANSACTION"),
                   seq(str("TO TRANSACTION"), new Reuse.Source()),
                   str("PROGRAM"),
                   seq(str("TO SCREEN"), new Reuse.Integer())));
  }

}