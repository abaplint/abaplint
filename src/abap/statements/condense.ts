import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Condense extends Statement {

  public get_matcher(): IRunnable {
    return seq(str("CONDENSE"),
               new Target(),
               opt(str("NO-GAPS")));
  }

}