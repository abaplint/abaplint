import {star, sub, alt, sta} from "./_combi";
import * as Structures from ".";
import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {IStructureRunnable} from "./_structure_runnable";

export class Any implements IStructure {

  public getMatcher(): IStructureRunnable {

    return star(alt(sta(Statements.ClassOther),
                    sta(Statements.ClassDeferred),
                    sta(Statements.Report),
                    sta(Statements.Program),
                    sta(Statements.Parameter),
                    sta(Statements.CheckSelectOptions),
                    sta(Statements.Get),
                    sta(Statements.Initialization),
                    sta(Statements.InterfaceDeferred),
                    sta(Statements.SelectionScreen),
                    sta(Statements.SelectOption),
                    sta(Statements.AtSelectionScreen),
                    sta(Statements.AtLineSelection),
                    sta(Statements.AtUserCommand),
                    sta(Statements.StartOfSelection),
                    sta(Statements.EndOfSelection),
                    sta(Statements.LoadOfProgram),
                    sta(Statements.TopOfPage),
                    sta(Statements.EndOfPage),
                    sta(Statements.Controls),
                    sta(Statements.TypePools),
                    sta(Statements.TypePool),
                    sta(Statements.FunctionPool),
                    sub(Structures.Normal),
                    sub(Structures.Form),
                    sub(Structures.Module),
                    sub(Structures.FunctionModule),
                    sub(Structures.Interface),
                    sub(Structures.ClassDefinition),
                    sub(Structures.ClassImplementation)));

  }

}