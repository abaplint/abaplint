import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Cleanup extends Statement {

  public static get_matcher(): IRunnable {
    let into = seq(str("INTO"), new Target());

    return seq(str("CLEANUP"), opt(into));
  }

}