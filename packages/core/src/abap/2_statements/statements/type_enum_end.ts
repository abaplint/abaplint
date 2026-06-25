import {IStatement} from "./_statement";
import {opt, seq, ver, AlsoIn} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class TypeEnumEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq("STRUCTURE", NamespaceSimpleName);

    const ret = ver(Release.v751, seq("TYPES", "END OF", "ENUM", NamespaceSimpleName, opt(structure)), {also: AlsoIn.OpenABAP});

    return ret;
  }

}