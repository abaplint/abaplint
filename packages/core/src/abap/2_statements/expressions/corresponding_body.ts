import {seq, Expression, plus, ver, optPrio, alt} from "../combi";
import {Source, Field, CorrespondingBodyBase, CorrespondingBodyMapping} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CorrespondingBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const discarding = ver(Version.v751, "DISCARDING DUPLICATES");

    return seq(
      optPrio("DEEP"),
      optPrio(CorrespondingBodyBase),
      Source,
      optPrio(discarding),
      optPrio(CorrespondingBodyMapping),
      optPrio("CHANGING CONTROL"),
      optPrio(seq("MAPPING FROM ENTITY", optPrio("USING CONTROL"))), // todo, version something?
      optPrio(seq("EXCEPT", alt(plus(Field), "*"))),
    );
  }
}