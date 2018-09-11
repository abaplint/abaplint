import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";

export class Tables extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("TABLES"), new Field());
  }

}