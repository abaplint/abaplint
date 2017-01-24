import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class ReadDataset extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("READ DATASET"),
               new Reuse.Source(),
               str("INTO"),
               new Reuse.Target(),
               opt(seq(str("MAXIMUM LENGTH"), new Reuse.Source())),
               opt(seq(str("ACTUAL LENGTH"), new Reuse.Target())),
               opt(seq(str("LENGTH"), new Reuse.Target())));
  }

}