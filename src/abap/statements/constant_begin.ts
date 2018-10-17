import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class ConstantBegin extends Statement {

  public getMatcher(): IRunnable {

    let ret = seq(str("CONSTANTS"), str("BEGIN"), str("OF"), new NamespaceSimpleName());

    return ret;
  }

}