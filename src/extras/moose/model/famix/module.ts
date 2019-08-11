// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {CompilationUnit} from "./../famix/compilation_unit";
import {ScopingEntity} from "./../famix/scoping_entity";


export class Module extends ScopingEntity {


  private moduleCompilationUnit: CompilationUnit;

  // @FameProperty(name = "compilationUnit", opposite = "module")
  public getCompilationUnit(): CompilationUnit {
    return this.moduleCompilationUnit;
  }

  public setCompilationUnit(newCompilationUnit: CompilationUnit) {
    if (this.moduleCompilationUnit === undefined) {
      this.moduleCompilationUnit = newCompilationUnit;
      newCompilationUnit.setModule(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Module", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("compilationUnit", this.getCompilationUnit());

  }

}

