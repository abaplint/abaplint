// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {StructuralEntity} from "./../famix/structural_entity";
import {BehaviouralEntity} from "./../famix/behavioural_entity";


export class LocalVariable extends StructuralEntity {


  private localVariableParentBehaviouralEntity: BehaviouralEntity;

  // oneMany.Getter
  // @FameProperty(name = "parentBehaviouralEntity", opposite = "localVariables")
  public getParentBehaviouralEntity(): BehaviouralEntity {
    return this.localVariableParentBehaviouralEntity;
  }

  // oneMany.Setter
  public setParentBehaviouralEntity(newParentBehaviouralEntity: BehaviouralEntity) {
    this.localVariableParentBehaviouralEntity = newParentBehaviouralEntity;
    newParentBehaviouralEntity.getLocalVariables().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.LocalVariable", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("parentBehaviouralEntity", this.getParentBehaviouralEntity());

  }

}

