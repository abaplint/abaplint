import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Value, NamespaceSimpleName} from "../expressions";

export class TypeEnum extends Statement {

  public getMatcher(): IStatementRunnable {

// it is also possible to define without Value, this is covered by normal type
    const ret = seq(str("TYPES"), new NamespaceSimpleName(), new Value());

    return ret;
  }

}