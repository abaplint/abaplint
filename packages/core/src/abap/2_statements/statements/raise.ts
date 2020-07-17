import {IStatement} from "./_statement";
import {str, seq, alt, opt, ver} from "../combi";
import {Version} from "../../../version";
import {Source, Field, ParameterListS, ClassName, MessageSource} from "../expressions";
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
                       opt(wit));

    const exporting = seq(str("EXPORTING"), new ParameterListS());

    const from = alt(new Source(),
                     seq(str("TYPE"), new ClassName()));

    const clas = seq(opt(str("RESUMABLE")),
                     str("EXCEPTION"),
                     from,
                     opt(alt(ver(Version.v750, alt(mess, messid)), ver(Version.v752, str("USING MESSAGE")))),
                     opt(exporting));

    const ret = seq(str("RAISE"), alt(new Field(), clas));

    return ret;
  }

}