import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {ClassName} from "../expressions";

export class ClassImplementation extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("CLASS"), new ClassName(), str("IMPLEMENTATION"));
  }

}