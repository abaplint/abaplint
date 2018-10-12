import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeBegin extends Statement {

  public get_matcher(): IRunnable {
    let begin = seq(str("BEGIN OF"), new NamespaceSimpleName());

    let ret = seq(alt(str("TYPE"), str("TYPES")), begin);

    return ret;
  }

}