import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Private extends Statement {

  public get_matcher(): IRunnable {
    return str("PRIVATE SECTION");
  }

}