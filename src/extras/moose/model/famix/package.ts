// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {NamedEntity} from "./../famix/named_entity";
import {ScopingEntity} from "./../famix/scoping_entity";


export class Package extends ScopingEntity {


  private packageNumberOfClientPackages: Number;

  // @FameProperty(name = "numberOfClientPackages")
  public getNumberOfClientPackages(): Number {
    return this.packageNumberOfClientPackages;
  }

  public setNumberOfClientPackages(packageNumberOfClientPackages: Number) {
    this.packageNumberOfClientPackages = packageNumberOfClientPackages;
  }

  private packageChildNamedEntities: Set<NamedEntity> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "childNamedEntities", opposite = "parentPackage", derived = true)
  public getChildNamedEntities(): Set<NamedEntity> {
    return this.packageChildNamedEntities;
  }

  // manyOne.Setter
  public addChildNamedEntities(packageChildNamedEntities: NamedEntity) {
    if (!this.packageChildNamedEntities.has(packageChildNamedEntities)) {
      this.packageChildNamedEntities.add(packageChildNamedEntities);
      packageChildNamedEntities.setParentPackage(this);
    }
  }

  private packageNumberOfMethods: Number;

  // @FameProperty(name = "numberOfMethods")
  public getNumberOfMethods(): Number {
    return this.packageNumberOfMethods;
  }

  public setNumberOfMethods(packageNumberOfMethods: Number) {
    this.packageNumberOfMethods = packageNumberOfMethods;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Package", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("numberOfClientPackages", this.getNumberOfClientPackages());
    exporter.addProperty("numberOfMethods", this.getNumberOfMethods());
    exporter.addProperty("childNamedEntities", this.getChildNamedEntities());

  }

}

