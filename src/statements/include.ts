import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Include extends Statement {
  public static get_matcher(): IRunnable {
    return seq(str("INCLUDE"), new Reuse.IncludeName(), opt(str("IF FOUND")));
  }
}