import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class ReadDataset extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("READ DATASET"),
               new Source(),
               str("INTO"),
               new Target(),
               opt(seq(str("MAXIMUM LENGTH"), new Source())),
               opt(seq(str("ACTUAL LENGTH"), new Target())),
               opt(seq(str("LENGTH"), new Target())));
  }

}