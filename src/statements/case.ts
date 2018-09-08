import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {Version} from "../version";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let ver = Combi.ver;

export class Case extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CASE"),
               opt(ver(Version.v750, str("TYPE OF"))),
               new Reuse.Source());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}