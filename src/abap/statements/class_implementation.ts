import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {ClassName} from "../expressions";

export class ClassImplementation extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CLASS"), new ClassName(), str("IMPLEMENTATION"));
  }

}