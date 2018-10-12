import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndSelect extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDSELECT");
  }

}