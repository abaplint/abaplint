import * as Statements from "../../2_statements/statements";
import {seq, opt, star, beginEnd, sta, sub} from "./_combi";
import {IStructure} from "./_structure";
import {PrivateSection} from "./private_section";
import {ProtectedSection} from "./protected_section";
import {PublicSection} from "./public_section";
import {IStructureRunnable} from "./_structure_runnable";

export class ClassDefinition implements IStructure {

  public getMatcher(): IStructureRunnable {
    const body = seq(
      opt(sta(Statements.SetExtendedCheck)),
      star(sta(Statements.TypePools)),
      opt(sub(PublicSection)),
      opt(sub(ProtectedSection)),
      opt(sub(PrivateSection)),
      opt(sta(Statements.SetExtendedCheck)));

    return beginEnd(sta(Statements.ClassDefinition), body, sta(Statements.EndClass));
  }

}