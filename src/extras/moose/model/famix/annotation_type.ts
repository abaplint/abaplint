// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Type} from "./../famix/type";
import {ContainerEntity} from "./../famix/container_entity";
import {AnnotationInstance} from "./../famix/annotation_instance";


export class AnnotationType extends Type {


  private annotationTypeContainer: ContainerEntity;

  // oneMany.Getter
  // @FameProperty(name = "container", opposite = "definedAnnotationTypes")
  public getContainer(): ContainerEntity {
    return this.annotationTypeContainer;
  }

  // oneMany.Setter
  public setContainer(newContainer: ContainerEntity) {
    this.annotationTypeContainer = newContainer;
    newContainer.getDefinedAnnotationTypes().add(this);
  }

  private annotationTypeInstances: Set<AnnotationInstance> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "instances", opposite = "annotationType", derived = true)
  public getInstances(): Set<AnnotationInstance> {
    return this.annotationTypeInstances;
  }

  // manyOne.Setter
  public addInstances(annotationTypeInstances: AnnotationInstance) {
    if (!this.annotationTypeInstances.has(annotationTypeInstances)) {
      this.annotationTypeInstances.add(annotationTypeInstances);
      annotationTypeInstances.setAnnotationType(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.AnnotationType", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("container", this.getContainer());
    exporter.addProperty("instances", this.getInstances());

  }

}

