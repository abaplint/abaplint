import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";

export class FunctionModule extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("FUNCTION"), new Field());
  }

}