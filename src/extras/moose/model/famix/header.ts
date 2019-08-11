// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {File} from "./../file/file";


export class Header extends File {




  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Header", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);

  }

}

