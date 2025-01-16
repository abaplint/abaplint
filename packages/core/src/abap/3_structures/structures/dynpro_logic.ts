import {IStructure} from "./_structure";
import * as Structures from "./";
import {opt, seq, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class DynproLogic implements IStructure {

  public getMatcher(): IStructureRunnable {
    return seq(
      sub(Structures.ProcessBeforeOutput),
      sub(Structures.ProcessAfterInput),
      opt(sub(Structures.ProcessOnValueRequest)),
    );
  }

}