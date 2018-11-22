import {Statement} from "./_statement";
import {str, IRunnable} from "../combi";

// todo, rename to EndMethod
export class Endmethod extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDMETHOD");
  }

}