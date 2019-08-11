// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {SourceAnchor} from "./../famix/source_anchor";


export class SourceTextAnchor extends SourceAnchor {


  private sourceTextAnchorSource: String;

  // @FameProperty(name = "source")
  public getSource(): String {
    return this.sourceTextAnchorSource;
  }

  public setSource(sourceTextAnchorSource: String) {
    this.sourceTextAnchorSource = sourceTextAnchorSource;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.SourceTextAnchor", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("source", this.getSource());

  }

}

