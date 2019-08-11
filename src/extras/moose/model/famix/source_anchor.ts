// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Entity} from "./../famix/entity";
import {SourcedEntity} from "./../famix/sourced_entity";


export class SourceAnchor extends Entity {


  private sourceAnchorElement: SourcedEntity;

  // @FameProperty(name = "element", opposite = "sourceAnchor")
  public getElement(): SourcedEntity {
    return this.sourceAnchorElement;
  }

  public setElement(newElement: SourcedEntity) {
    if (this.sourceAnchorElement === undefined) {
      this.sourceAnchorElement = newElement;
      newElement.setSourceAnchor(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.SourceAnchor", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("element", this.getElement());

  }

}

