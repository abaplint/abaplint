// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {StructuralEntity} from "./../famix/structural_entity";
import {Association} from "./../famix/association";
import {BehaviouralEntity} from "./../famix/behavioural_entity";


export class Access extends Association {


  private accessAccessor: BehaviouralEntity;

  // oneMany.Getter
  // @FameProperty(name = "accessor", opposite = "accesses")
  public getAccessor(): BehaviouralEntity {
    return this.accessAccessor;
  }

  // oneMany.Setter
  public setAccessor(newAccessor: BehaviouralEntity) {
    this.accessAccessor = newAccessor;
    newAccessor.getAccesses().add(this);
  }

  private accessVariable: StructuralEntity;

  // oneMany.Getter
  // @FameProperty(name = "variable", opposite = "incomingAccesses")
  public getVariable(): StructuralEntity {
    return this.accessVariable;
  }

  // oneMany.Setter
  public setVariable(newVariable: StructuralEntity) {
    this.accessVariable = newVariable;
    newVariable.getIncomingAccesses().add(this);
  }

  private accessIsWrite: Boolean;

  // @FameProperty(name = "isWrite")
  public getIsWrite(): Boolean {
    return this.accessIsWrite;
  }

  public setIsWrite(accessIsWrite: Boolean) {
    this.accessIsWrite = accessIsWrite;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Access", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("accessor", this.getAccessor());
    exporter.addProperty("variable", this.getVariable());
    exporter.addProperty("isWrite", this.getIsWrite());

  }

}

