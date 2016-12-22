import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Clear extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let wit = seq(str("WITH"), new Reuse.Source());

    let character = str("IN CHARACTER MODE");

    return seq(str("CLEAR"),
               new Reuse.Target(),
               opt(wit),
               opt(character));
  }

}