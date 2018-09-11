import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {IncludeName} from "../expressions";

export class Include extends Statement {
  public static get_matcher(): IRunnable {
    return seq(str("INCLUDE"), new IncludeName(), opt(str("IF FOUND")));
  }
}