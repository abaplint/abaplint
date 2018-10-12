import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";

export class TestInjection extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("TEST-INJECTION"), new Field());
  }

}