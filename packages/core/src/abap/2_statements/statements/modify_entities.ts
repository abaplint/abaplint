import {IStatement} from "./_statement";
import {seq, vers} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ModifyEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq("MODIFY ENTITIES OF", SimpleName,
                  "ENTITY", SimpleName,
                  "UPDATE SET FIELDS WITH", Source,
                  "FAILED", Target,
                  "REPORTED", Target);
    return vers(Version.v754, s);
  }

}