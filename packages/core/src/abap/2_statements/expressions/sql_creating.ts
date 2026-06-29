import {seq, starPrio, Expression, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLCreatingTypeSpec} from "./sql_creating_type_spec";
import {Dynamic} from "./dynamic";

export class SQLCreating extends Expression {
  public getRunnable(): IStatementRunnable {
    const typeSpecs = seq(SQLCreatingTypeSpec, starPrio(SQLCreatingTypeSpec));
    return seq("CREATING", altPrio(Dynamic, typeSpecs));
  }
}
