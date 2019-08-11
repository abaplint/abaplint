// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {SourceLanguage} from "./../famix/source_language";


export class UnknownSourceLanguage extends SourceLanguage {




  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.UnknownSourceLanguage", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);

  }

}

