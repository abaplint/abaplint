// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Entity} from "./../famix/entity";
import {AnnotationTypeAttribute} from "./../famix/annotation_type_attribute";
import {AnnotationInstance} from "./../famix/annotation_instance";


export class AnnotationInstanceAttribute extends Entity {


  private annotationInstanceAttributeAnnotationTypeAttribute: AnnotationTypeAttribute;

  // oneMany.Getter
  // @FameProperty(name = "annotationTypeAttribute", opposite = "annotationAttributeInstances")
  public getAnnotationTypeAttribute(): AnnotationTypeAttribute {
    return this.annotationInstanceAttributeAnnotationTypeAttribute;
  }

  // oneMany.Setter
  public setAnnotationTypeAttribute(newAnnotationTypeAttribute: AnnotationTypeAttribute) {
    this.annotationInstanceAttributeAnnotationTypeAttribute = newAnnotationTypeAttribute;
    newAnnotationTypeAttribute.getAnnotationAttributeInstances().add(this);
  }

  private annotationInstanceAttributeParentAnnotationInstance: AnnotationInstance;

  // oneMany.Getter
  // @FameProperty(name = "parentAnnotationInstance", opposite = "attributes")
  public getParentAnnotationInstance(): AnnotationInstance {
    return this.annotationInstanceAttributeParentAnnotationInstance;
  }

  // oneMany.Setter
  public setParentAnnotationInstance(newParentAnnotationInstance: AnnotationInstance) {
    this.annotationInstanceAttributeParentAnnotationInstance = newParentAnnotationInstance;
    newParentAnnotationInstance.getAttributes().add(this);
  }

  private annotationInstanceAttributeValue: String;

  // @FameProperty(name = "value")
  public getValue(): String {
    return this.annotationInstanceAttributeValue;
  }

  public setValue(annotationInstanceAttributeValue: String) {
    this.annotationInstanceAttributeValue = annotationInstanceAttributeValue;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.AnnotationInstanceAttribute", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("annotationTypeAttribute", this.getAnnotationTypeAttribute());
    exporter.addProperty("parentAnnotationInstance", this.getParentAnnotationInstance());
    exporter.addProperty("value", this.getValue());

  }

}

