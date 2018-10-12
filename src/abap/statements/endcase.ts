import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndCase extends Statement {

  public get_matcher(): IRunnable {
    return str("ENDCASE");
  }

}