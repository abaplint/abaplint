import { Statement } from "./statement";
import { Token } from "../tokens/";
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

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new ReadDataset(tokens);
    }
    return undefined;
  }

}