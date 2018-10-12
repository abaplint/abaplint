import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndIf extends Statement {

  public getMatcher(): IRunnable {
    return str("ENDIF");
  }

}