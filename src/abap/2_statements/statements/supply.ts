import {IStatement} from "./_statement";
import {verNot, str, seq, plus, IStatementRunnable} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";

export class Supply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(new Field(), str("="), new Source());

    const ret = seq(str("SUPPLY"),
                    plus(field),
                    str("TO CONTEXT"),
                    new Field());

    return verNot(Version.Cloud, ret);
  }

}