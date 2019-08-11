// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Method} from "./../famix/method";
import {Exception} from "./../famix/exception";


export class CaughtException extends Exception {


  private caughtExceptionDefiningMethod: Method;

  // oneMany.Getter
  // @FameProperty(name = "definingMethod", opposite = "caughtExceptions")
  public getDefiningMethod(): Method {
    return this.caughtExceptionDefiningMethod;
  }

  // oneMany.Setter
  public setDefiningMethod(newDefiningMethod: Method) {
    this.caughtExceptionDefiningMethod = newDefiningMethod;
    newDefiningMethod.getCaughtExceptions().add(this);
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.CaughtException", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("definingMethod", this.getDefiningMethod());

  }

}

