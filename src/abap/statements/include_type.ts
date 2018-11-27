import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, IStatementRunnable} from "../combi";
import {Source, Field, TypeName} from "../expressions";
import {Version} from "../../version";

export class IncludeType extends Statement {

  public getMatcher(): IStatementRunnable {
    const tas = seq(str("AS"), new Field());

    const renaming = seq(str("RENAMING WITH SUFFIX"), new Source());

    const ret = seq(str("INCLUDE"),
                    alt(str("TYPE"), str("STRUCTURE")),
                    new TypeName(),
                    opt(tas),
                    opt(renaming));

    return verNot(Version.Cloud, ret);
  }

}