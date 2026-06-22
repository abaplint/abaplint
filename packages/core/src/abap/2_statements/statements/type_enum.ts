import {IStatement} from "./_statement";
import {seq, ver, AlsoIn} from "../combi";
import {Value, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class TypeEnum implements IStatement {

  public getMatcher(): IStatementRunnable {

// it is also possible to define without Value, this is covered by normal type
    const ret = ver(Release.v751, seq("TYPES", NamespaceSimpleName, Value), {also: AlsoIn.OpenABAP});

    return ret;
  }

}