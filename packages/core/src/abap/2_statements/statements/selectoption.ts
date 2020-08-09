import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, per} from "../combi";
import {Source, FieldChain, Constant, Field, Modif, Dynamic, SimpleSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectOption implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = alt(new Constant(), new FieldChain());

    const to = seq(str("TO"), sourc);

    const def = seq(str("DEFAULT"),
                    sourc,
                    opt(to));

    const option = seq(str("OPTION"), new Field());
    const sign = seq(str("SIGN"), new Field());

    const memory = seq(str("MEMORY ID"), new SimpleSource());

    const match = seq(str("MATCHCODE OBJECT"), new Field());

    const modif = seq(str("MODIF ID"), new Modif());

    const visible = seq(str("VISIBLE LENGTH"), new Source());

    const options = per(def,
                        option,
                        sign,
                        memory,
                        match,
                        visible,
                        modif,
                        str("NO DATABASE SELECTION"),
                        str("LOWER CASE"),
                        str("NO-EXTENSION"),
                        str("NO INTERVALS"),
                        str("NO-DISPLAY"),
                        str("OBLIGATORY"));

    const ret = seq(str("SELECT-OPTIONS"),
                    new Field(),
                    str("FOR"),
                    alt(new FieldChain(), new Dynamic()),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}