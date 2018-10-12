import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndTestInjection extends Statement {

  public getMatcher(): IRunnable {
    return str("END-TEST-INJECTION");
  }

}