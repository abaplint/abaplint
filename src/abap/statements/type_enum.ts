import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {Value, NamespaceSimpleName} from "../expressions";

export class TypeEnum extends Statement {

  public getMatcher(): IRunnable {

    let ret = seq(str("TYPES"), new NamespaceSimpleName(), new Value());

    return ret;
  }

}