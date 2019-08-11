// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {SourcedEntity} from "./../famix/sourced_entity";


export class Association extends SourcedEntity {


  private associationNext: Association;

  // @FameProperty(name = "next", opposite = "previous", derived = true)
  public getNext(): Association {
    return this.associationNext;
  }

  public setNext(newNext: Association) {
    if (this.associationNext === undefined) {
      this.associationNext = newNext;
      newNext.setPrevious(this);
    }
  }

  private associationPrevious: Association;

  // @FameProperty(name = "previous", opposite = "next")
  public getPrevious(): Association {
    return this.associationPrevious;
  }

  public setPrevious(newPrevious: Association) {
    if (this.associationPrevious === undefined) {
      this.associationPrevious = newPrevious;
      newPrevious.setNext(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Association", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("next", this.getNext());
    exporter.addProperty("previous", this.getPrevious());

  }

}

