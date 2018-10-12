import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndClass extends Statement {

  public get_matcher(): IRunnable {
    return str("ENDCLASS");
  }

}