import {seq, alt, opt, per, Expression, optPrio, ver} from "../combi";
import * as Expressions from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class DataDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    const simple = opt(per("READ-ONLY",
                           Expressions.Type,
                           Expressions.Length,
                           Expressions.Decimals,
                           Expressions.Value));

    const table = seq(Expressions.TypeTable, optPrio("READ-ONLY"));

    const boxed = ver(Version.v702, "BOXED");

    return seq(Expressions.DefinitionName,
               optPrio(Expressions.ConstantFieldLength),
               alt(simple, table, Expressions.TypeStructure),
               optPrio(boxed));

  }
}