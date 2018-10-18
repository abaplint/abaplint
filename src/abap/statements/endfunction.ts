import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndFunction extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDFUNCTION");
  }

}