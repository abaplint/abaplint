import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alt, per} from "../combi";
import {Source, FieldChain, Constant, Field, Modif, Dynamic, SimpleSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectOption implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sourc = alt(new Constant(), new FieldChain());

    const to = seqs("TO", sourc);

    const def = seqs("DEFAULT",
                     sourc,
                     opt(to));

    const option = seqs("OPTION", Field);
    const sign = seqs("SIGN", Field);

    const memory = seqs("MEMORY ID", SimpleSource);

    const match = seqs("MATCHCODE OBJECT", Field);

    const modif = seqs("MODIF ID", Modif);

    const visible = seqs("VISIBLE LENGTH", Source);

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

    const ret = seqs("SELECT-OPTIONS",
                     Field,
                     "FOR",
                     alt(new FieldChain(), new Dynamic()),
                     opt(options));

    return verNot(Version.Cloud, ret);
  }

}