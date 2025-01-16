import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import * as Structures from "./";
import {opt, seq, sta, star, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class DynproLogic implements IStructure {

  public getMatcher(): IStructureRunnable {
    const pov = star(sta(Statements.Field));

    return seq(
      sub(Structures.ProcessBeforeOutput),
      sub(Structures.ProcessAfterInput),
      opt(seq(sta(Statements.ProcessOnValueRequest), pov)),
    );
  }

}