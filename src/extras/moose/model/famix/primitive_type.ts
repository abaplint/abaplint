// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";


export class PrimitiveType extends Type {




  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.PrimitiveType", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);

  }

}

