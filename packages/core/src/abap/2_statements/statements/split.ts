import {IStatement} from "./_statement";
import {seq, altPrios, pluss, alt, opts} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Split implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seq("IN", alt("CHARACTER", "BYTE"), "MODE");

    const into = altPrios(seq("TABLE", Target, opts(mode)), pluss(Target));

    const ret = seq("SPLIT", Source, "AT", Source, "INTO", into);

    return ret;
  }

}