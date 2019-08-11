// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {FamixBaseElement} from "./../../famix_base_element";


export class Entity extends FamixBaseElement {




  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Entity", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);

  }

}

