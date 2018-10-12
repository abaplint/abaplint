import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndCase extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDCASE");
  }

}