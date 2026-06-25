import {IStatement} from "./_statement";
import {opt, seq, ver, AlsoIn} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class TypeEnumBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq("STRUCTURE", NamespaceSimpleName);

    const base = seq("BASE TYPE", NamespaceSimpleName);

    const em = seq("ENUM", NamespaceSimpleName, opt(structure), opt(base));

    const ret = ver(Release.v751, seq("TYPES", "BEGIN OF", em), {also: AlsoIn.OpenABAP});

    return ret;
  }

}