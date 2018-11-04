import {Statement} from "./_statement";
import {str, IRunnable} from "../combi";

export class Private extends Statement {

  public getMatcher(): IRunnable {
    return str("PRIVATE SECTION");
  }

}