// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {StructuralEntity} from "./../famix/structural_entity";
import {ScopingEntity} from "./../famix/scoping_entity";
import {Module} from "./../famix/module";


export class GlobalVariable extends StructuralEntity {


  private globalVariableParentScope: ScopingEntity;

  // oneMany.Getter
  // @FameProperty(name = "parentScope", opposite = "globalVariables")
  public getParentScope(): ScopingEntity {
    return this.globalVariableParentScope;
  }

  // oneMany.Setter
  public setParentScope(newParentScope: ScopingEntity) {
    this.globalVariableParentScope = newParentScope;
    newParentScope.getGlobalVariables().add(this);
  }

  private globalVariableParentModule: Module;

  // @FameProperty(name = "parentModule")
  public getParentModule(): Module {
    return this.globalVariableParentModule;
  }

  public setParentModule(globalVariableParentModule: Module) {
    this.globalVariableParentModule = globalVariableParentModule;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.GlobalVariable", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("parentScope", this.getParentScope());
    exporter.addProperty("parentModule", this.getParentModule());

  }

}

