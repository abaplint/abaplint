import {Statement} from "./_statement";
import {str, IRunnable} from "../combi";

export class EndTry extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDTRY");
  }

}