import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";

export class TestSeam extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("TEST-SEAM"), new Field());
  }

}