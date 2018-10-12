import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Retry extends Statement {

  public getMatcher(): IRunnable {
    return str("RETRY");
  }

}