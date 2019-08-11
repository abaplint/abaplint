// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";
import {Association} from "./../famix/association";


export class Inheritance extends Association {


  private inheritanceSuperclass: Type;

  // oneMany.Getter
  // @FameProperty(name = "superclass", opposite = "subInheritances")
  public getSuperclass(): Type {
    return this.inheritanceSuperclass;
  }

  // oneMany.Setter
  public setSuperclass(newSuperclass: Type) {
    this.inheritanceSuperclass = newSuperclass;
    newSuperclass.getSubInheritances().add(this);
  }

  private inheritanceSubclass: Type;

  // oneMany.Getter
  // @FameProperty(name = "subclass", opposite = "superInheritances")
  public getSubclass(): Type {
    return this.inheritanceSubclass;
  }

  // oneMany.Setter
  public setSubclass(newSubclass: Type) {
    this.inheritanceSubclass = newSubclass;
    newSubclass.getSuperInheritances().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Inheritance", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("superclass", this.getSuperclass());
    exporter.addProperty("subclass", this.getSubclass());

  }

}

