import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Target} from "../expressions";

export class ReadDataset extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("READ DATASET"),
               new Reuse.Source(),
               str("INTO"),
               new Target(),
               opt(seq(str("MAXIMUM LENGTH"), new Reuse.Source())),
               opt(seq(str("ACTUAL LENGTH"), new Target())),
               opt(seq(str("LENGTH"), new Target())));
  }

}