// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {BehaviouralEntity} from "./../famix/behavioural_entity";
import {ContainerEntity} from "./../famix/container_entity";
import {Module} from "./../famix/module";


export class Function extends BehaviouralEntity {


  private functionContainer: ContainerEntity;

  // oneMany.Getter
  // @FameProperty(name = "container", opposite = "functions")
  public getContainer(): ContainerEntity {
    return this.functionContainer;
  }

  // oneMany.Setter
  public setContainer(newContainer: ContainerEntity) {
    this.functionContainer = newContainer;
    newContainer.getFunctions().add(this);
  }

  private functionParentModule: Module;

  // @FameProperty(name = "parentModule")
  public getParentModule(): Module {
    return this.functionParentModule;
  }

  public setParentModule(functionParentModule: Module) {
    this.functionParentModule = functionParentModule;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Function", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("container", this.getContainer());
    exporter.addProperty("parentModule", this.getParentModule());

  }

}

