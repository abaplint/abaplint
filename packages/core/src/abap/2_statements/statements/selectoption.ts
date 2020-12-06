import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, pers} from "../combi";
import {Source, FieldChain, Constant, Field, Modif, Dynamic, SimpleSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectOption implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = alt(Constant, FieldChain);

    const to = seq("TO", sourc);

    const def = seq("DEFAULT",
                    sourc,
                    opt(to));

    const option = seq("OPTION", Field);
    const sign = seq("SIGN", Field);

    const memory = seq("MEMORY ID", SimpleSource);

    const match = seq("MATCHCODE OBJECT", Field);

    const modif = seq("MODIF ID", Modif);

    const visible = seq("VISIBLE LENGTH", Source);

    const options = pers(def,
                         option,
                         sign,
                         memory,
                         match,
                         visible,
                         modif,
                         "NO DATABASE SELECTION",
                         "LOWER CASE",
                         "NO-EXTENSION",
                         "NO INTERVALS",
                         "NO-DISPLAY",
                         "OBLIGATORY");

    const ret = seq("SELECT-OPTIONS",
                    Field,
                    "FOR",
                    alt(FieldChain, Dynamic),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}