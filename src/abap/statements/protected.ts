import {Statement} from "./_statement";
import {str, IRunnable} from "../combi";

export class Protected extends Statement {

  public getMatcher(): IRunnable {
    return str("PROTECTED SECTION");
  }

}