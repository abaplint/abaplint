import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Endselect extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDSELECT");
  }

}