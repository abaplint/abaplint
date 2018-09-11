import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";

export class Extract extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("EXTRACT"), new Field());
  }

}