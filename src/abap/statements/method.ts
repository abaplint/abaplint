import {Statement} from "./statement";
import {str, seq, opt, alt, regex as reg, IRunnable} from "../combi";

export class Method extends Statement {

  public getMatcher(): IRunnable {
    let name = reg(/[\w~]+/);

    let kernel = seq(str("BY KERNEL MODULE"),
                     name,
                     opt(alt(str("FAIL"), str("IGNORE"))));

    return seq(str("METHOD"), name, opt(kernel));
  }

}