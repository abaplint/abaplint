// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Entity} from "./../famix/entity";
import {SourcedEntity} from "./../famix/sourced_entity";


export class SourceLanguage extends Entity {


  private sourceLanguageSourcedEntities: Set<SourcedEntity> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "sourcedEntities", opposite = "declaredSourceLanguage", derived = true)
  public getSourcedEntities(): Set<SourcedEntity> {
    return this.sourceLanguageSourcedEntities;
  }

  // manyOne.Setter
  public addSourcedEntities(sourceLanguageSourcedEntities: SourcedEntity) {
    if (!this.sourceLanguageSourcedEntities.has(sourceLanguageSourcedEntities)) {
      this.sourceLanguageSourcedEntities.add(sourceLanguageSourcedEntities);
      sourceLanguageSourcedEntities.setDeclaredSourceLanguage(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.SourceLanguage", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("sourcedEntities", this.getSourcedEntities());

  }

}

