// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {GlobalVariable} from "./../famix/global_variable";
import {ContainerEntity} from "./../famix/container_entity";


export class ScopingEntity extends ContainerEntity {


  private scopingEntityGlobalVariables: Set<GlobalVariable> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "globalVariables", opposite = "parentScope", derived = true)
  public getGlobalVariables(): Set<GlobalVariable> {
    return this.scopingEntityGlobalVariables;
  }

  // manyOne.Setter
  public addGlobalVariables(scopingEntityGlobalVariables: GlobalVariable) {
    if (!this.scopingEntityGlobalVariables.has(scopingEntityGlobalVariables)) {
      this.scopingEntityGlobalVariables.add(scopingEntityGlobalVariables);
      scopingEntityGlobalVariables.setParentScope(this);
    }
  }

  private scopingEntityParentScope: ScopingEntity;

  // oneMany.Getter
  // @FameProperty(name = "parentScope", opposite = "childScopes")
  public getParentScope(): ScopingEntity {
    return this.scopingEntityParentScope;
  }

  // oneMany.Setter
  public setParentScope(newParentScope: ScopingEntity) {
    this.scopingEntityParentScope = newParentScope;
    newParentScope.getChildScopes().add(this);
  }

  private scopingEntityChildScopes: Set<ScopingEntity> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "childScopes", opposite = "parentScope", derived = true)
  public getChildScopes(): Set<ScopingEntity> {
    return this.scopingEntityChildScopes;
  }

  // manyOne.Setter
  public addChildScopes(scopingEntityChildScopes: ScopingEntity) {
    if (!this.scopingEntityChildScopes.has(scopingEntityChildScopes)) {
      this.scopingEntityChildScopes.add(scopingEntityChildScopes);
      scopingEntityChildScopes.setParentScope(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.ScopingEntity", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("globalVariables", this.getGlobalVariables());
    exporter.addProperty("parentScope", this.getParentScope());
    exporter.addProperty("childScopes", this.getChildScopes());

  }

}

