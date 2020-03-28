import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt} from "../combi";
import * as Expressions from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class IncludeType implements IStatement {

  public getMatcher(): IStatementRunnable {
    const tas = seq(str("AS"), new Expressions.Field());

    const renaming = seq(str("RENAMING WITH SUFFIX"), new Expressions.Source());

    const ret = seq(str("INCLUDE"),
                    alt(str("TYPE"), str("STRUCTURE")),
                    new Expressions.TypeName(),
                    opt(tas),
                    opt(renaming));

    return verNot(Version.Cloud, ret);
  }

}