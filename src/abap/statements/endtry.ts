import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class EndTry extends Statement {

  public get_matcher(): IRunnable {
    return str("ENDTRY");
  }

}