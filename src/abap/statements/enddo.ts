import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndDo extends Statement {

  public get_matcher(): IRunnable {
    return str("ENDDO");
  }

}