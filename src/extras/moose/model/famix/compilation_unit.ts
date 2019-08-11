// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Module} from "./../famix/module";
import {File} from "./../file/file";


export class CompilationUnit extends File {


  private compilationUnitModule: Module;

  // @FameProperty(name = "module", opposite = "compilationUnit")
  public getModule(): Module {
    return this.compilationUnitModule;
  }

  public setModule(newModule: Module) {
    if (this.compilationUnitModule === undefined) {
      this.compilationUnitModule = newModule;
      newModule.setCompilationUnit(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.CompilationUnit", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("module", this.getModule());

  }

}

