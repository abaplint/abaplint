import {IStatement} from "./_statement";
import {str, seq, alt, opt, ver, optPrio, altPrio} from "../combi";
import {Version} from "../../../version";
import {Source, Field, ParameterListS, ClassName, MessageSource, BasicSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Raise implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq(str("WITH"),
                    new Source(),
                    opt(new Source()),
                    opt(new Source()),
                    opt(new Source()));

    const mess = seq(str("MESSAGE"),
                     new MessageSource(),
                     opt(wit));

    const messid = seq(str("MESSAGE ID"),
                       new Source(),
                       str("NUMBER"),
                       new Source(),
                       optPrio(wit));

    const exporting = seq(str("EXPORTING"), new ParameterListS());

    const from = altPrio(seq(str("TYPE"), new ClassName()),
                         altPrio(ver(Version.v752, new Source()), new BasicSource()));

    const clas = seq(optPrio(str("RESUMABLE")),
                     str("EXCEPTION"),
                     from,
                     opt(alt(ver(Version.v750, alt(mess, messid)), ver(Version.v752, str("USING MESSAGE")))),
                     optPrio(exporting));

    const ret = seq(str("RAISE"), altPrio(clas, new Field()));

    return ret;
  }

}