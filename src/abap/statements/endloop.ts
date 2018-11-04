import {Statement} from "./_statement";
import {str, IRunnable} from "../combi";

export class EndLoop extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDLOOP");
  }

}