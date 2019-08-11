// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";
import {Association} from "./../famix/association";
import {BehaviouralEntity} from "./../famix/behavioural_entity";


export class Reference extends Association {


  private referenceSource: BehaviouralEntity;

  // oneMany.Getter
  // @FameProperty(name = "source", opposite = "outgoingReferences")
  public getSource(): BehaviouralEntity {
    return this.referenceSource;
  }

  // oneMany.Setter
  public setSource(newSource: BehaviouralEntity) {
    this.referenceSource = newSource;
    newSource.getOutgoingReferences().add(this);
  }

  private referenceTarget: Type;

  // oneMany.Getter
  // @FameProperty(name = "target", opposite = "incomingReferences")
  public getTarget(): Type {
    return this.referenceTarget;
  }

  // oneMany.Setter
  public setTarget(newTarget: Type) {
    this.referenceTarget = newTarget;
    newTarget.getIncomingReferences().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Reference", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("source", this.getSource());
    exporter.addProperty("target", this.getTarget());

  }

}

