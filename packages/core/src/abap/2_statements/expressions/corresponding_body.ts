import {seq, Expression, plus, ver, optPrio, alt} from "../combi";
import {ComponentName, Source, Field, CorrespondingBodyBase} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentChain} from "./component_chain";

export class CorrespondingBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const mapping = seq("MAPPING", plus(seq(ComponentName, "=", ComponentChain)));

    const discarding = ver(Version.v751, "DISCARDING DUPLICATES");

    return seq(
      optPrio("DEEP"),
      optPrio(CorrespondingBodyBase),
      Source,
      optPrio(discarding),
      optPrio(mapping),
      optPrio("CHANGING CONTROL"),
      optPrio(seq("MAPPING FROM ENTITY", optPrio("USING CONTROL"))), // todo, version something?
      optPrio(seq("EXCEPT", alt(plus(Field), "*"))),
    );
  }
}