import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class ReadDataset extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("READ DATASET"),
               Reuse.source(),
               str("INTO"),
               Reuse.target(),
               opt(seq(str("MAXIMUM LENGTH"), Reuse.target())),
               opt(seq(str("ACTUAL LENGTH"), Reuse.target())),
               opt(seq(str("LENGTH"), Reuse.target())));
  }

}