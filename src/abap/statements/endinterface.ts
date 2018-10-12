import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndInterface extends Statement {

  public get_matcher(): IRunnable {
    return str("ENDINTERFACE");
  }

}