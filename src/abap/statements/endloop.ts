import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndLoop extends Statement {

  public get_matcher(): IRunnable {
    return str("ENDLOOP");
  }

}