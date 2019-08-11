// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Entity} from "./../famix/entity";
import {NamedEntity} from "./../famix/named_entity";
import {AnnotationType} from "./../famix/annotation_type";
import {AnnotationInstanceAttribute} from "./../famix/annotation_instance_attribute";


export class AnnotationInstance extends Entity {


  private annotationInstanceAnnotatedEntity: NamedEntity;

  // oneMany.Getter
  // @FameProperty(name = "annotatedEntity", opposite = "annotationInstances")
  public getAnnotatedEntity(): NamedEntity {
    return this.annotationInstanceAnnotatedEntity;
  }

  // oneMany.Setter
  public setAnnotatedEntity(newAnnotatedEntity: NamedEntity) {
    this.annotationInstanceAnnotatedEntity = newAnnotatedEntity;
    newAnnotatedEntity.getAnnotationInstances().add(this);
  }

  private annotationInstanceAnnotationType: AnnotationType;

  // oneMany.Getter
  // @FameProperty(name = "annotationType", opposite = "instances")
  public getAnnotationType(): AnnotationType {
    return this.annotationInstanceAnnotationType;
  }

  // oneMany.Setter
  public setAnnotationType(newAnnotationType: AnnotationType) {
    this.annotationInstanceAnnotationType = newAnnotationType;
    newAnnotationType.getInstances().add(this);
  }

  private annotationInstanceAttributes: Set<AnnotationInstanceAttribute> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "attributes", opposite = "parentAnnotationInstance", derived = true)
  public getAttributes(): Set<AnnotationInstanceAttribute> {
    return this.annotationInstanceAttributes;
  }

  // manyOne.Setter
  public addAttributes(annotationInstanceAttributes: AnnotationInstanceAttribute) {
    if (!this.annotationInstanceAttributes.has(annotationInstanceAttributes)) {
      this.annotationInstanceAttributes.add(annotationInstanceAttributes);
      annotationInstanceAttributes.setParentAnnotationInstance(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.AnnotationInstance", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("annotatedEntity", this.getAnnotatedEntity());
    exporter.addProperty("annotationType", this.getAnnotationType());
    exporter.addProperty("attributes", this.getAttributes());

  }

}

