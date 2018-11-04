import {Statement} from "./_statement";
import {str, IRunnable} from "../combi";

export class EndWhile extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDWHILE");
  }

}