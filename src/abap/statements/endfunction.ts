import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Endfunction extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDFUNCTION");
  }

}