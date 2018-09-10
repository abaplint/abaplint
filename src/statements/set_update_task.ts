import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class SetUpdateTask extends Statement {
  public static get_matcher(): IRunnable {
    return str("SET UPDATE TASK LOCAL");
  }
}