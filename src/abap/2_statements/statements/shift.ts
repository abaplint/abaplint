import {IStatement} from "./_statement";
import {str, seq, alt, opt, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Shift implements IStatement {

  public getMatcher(): IStatementRunnable {
    const deleting = seq(str("DELETING"), alt(str("LEADING"), str("TRAILING")), new Source());
    const up = seq(str("UP TO"), new Source());
    const mode = seq(str("IN"), alt(str("CHARACTER"), str("BYTE")), str("MODE"));
    const dir = alt(str("LEFT"), str("RIGHT"));
    const by = seq(str("BY"), new Source(), opt(str("PLACES")));

    const options = per(deleting, up, mode, dir, by, str("CIRCULAR"));

    return seq(str("SHIFT"),
               new Target(),
               opt(options));
  }

}