import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Continue extends Statement {

  public get_matcher(): IRunnable {
    return str("CONTINUE");
  }

}