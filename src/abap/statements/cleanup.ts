import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Cleanup extends Statement {

  public getMatcher(): IRunnable {
    let into = seq(str("INTO"), new Target());

    return seq(str("CLEANUP"), opt(into));
  }

}