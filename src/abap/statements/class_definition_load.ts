import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {ClassName} from "../expressions";

export class ClassDefinitionLoad extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("CLASS"), new ClassName(), str("DEFINITION LOAD"));
  }

}