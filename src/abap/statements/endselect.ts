import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndSelect extends Statement {

  public get_matcher(): IRunnable {
    return str("ENDSELECT");
  }

}