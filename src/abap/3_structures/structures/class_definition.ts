import * as Statements from "../../2_statements/statements";
import {seq, opt, star, beginEnd, sta, sub} from "./_combi";
import {IStructure} from "./_structure";
import {PrivateSection} from "./private_section";
import {ProtectedSection} from "./protected_section";
import {PublicSection} from "./public_section";
import {SetExtendedCheck, TypePools} from "../../2_statements/statements";
import {IStructureRunnable} from "./_structure_runnable";

export class ClassDefinition implements IStructure {

  public getMatcher(): IStructureRunnable {
    const body = seq(
      opt(sta(SetExtendedCheck)),
      star(sta(TypePools)),
      opt(sub(new PublicSection())),
      opt(sub(new ProtectedSection())),
      opt(sub(new PrivateSection())),
      opt(sta(SetExtendedCheck)));

    return beginEnd(sta(Statements.ClassDefinition), body, sta(Statements.EndClass));
  }

}