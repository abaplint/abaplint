import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {Value, NamespaceSimpleName} from "../expressions";

export class TypeEnum extends Statement {

  public getMatcher(): IRunnable {

// it is also possible to define without Value, this is covered by normal type
    let ret = seq(str("TYPES"), new NamespaceSimpleName(), new Value());

    return ret;
  }

}