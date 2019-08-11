// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";


export class Class extends Type {


  private classIsInterface: Boolean;

  // @FameProperty(name = "isInterface")
  public getIsInterface(): Boolean {
    return this.classIsInterface;
  }

  public setIsInterface(classIsInterface: Boolean) {
    this.classIsInterface = classIsInterface;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Class", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("isInterface", this.getIsInterface());

  }

}

