import {IStatement} from "./_statement";
import {verNot, str, seq, opt, plus, IStatementRunnable} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";
import {Version} from "../../../version";

export class LogPoint implements IStatement {

  public getMatcher(): IStatementRunnable {
    const subkey = seq(str("SUBKEY"), new Source());

    const fields = seq(str("FIELDS"), plus(new Source()));

    const ret = seq(str("LOG-POINT ID"),
                    new NamespaceSimpleName(),
                    opt(subkey),
                    opt(fields));

    return verNot(Version.Cloud, ret);
  }

}