import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {FieldSub} from "../expressions";

export class Fields extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FIELDS"), new FieldSub());
  }

}