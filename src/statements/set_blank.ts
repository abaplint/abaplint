import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class SetBlank extends Statement {

  public static get_matcher(): IRunnable {
    return str("SET BLANK LINES ON");
  }

}