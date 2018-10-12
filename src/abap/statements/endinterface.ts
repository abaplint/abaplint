import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndInterface extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDINTERFACE");
  }

}