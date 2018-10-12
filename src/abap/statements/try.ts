import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Try extends Statement {

  public getMatcher(): IRunnable {
    return str("TRY");
  }

}