import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class InterfaceDef extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let abstract = alt(seq(str("ABSTRACT METHODS"), new Reuse.Field()),
                       str("ALL METHODS ABSTRACT"),
                       str("PARTIALLY IMPLEMENTED"));

    return seq(str("INTERFACES"),
               new Reuse.Field(),
               opt(abstract));
  }

}