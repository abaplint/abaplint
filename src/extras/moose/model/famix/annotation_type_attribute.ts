// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {Attribute} from "./../famix/attribute";
import {AnnotationInstanceAttribute} from "./../famix/annotation_instance_attribute";


export class AnnotationTypeAttribute extends Attribute {


  private annotationTypeAttributeAnnotationAttributeInstances: Set<AnnotationInstanceAttribute> = new Set();

  // manyOne.Getter
  // @FameProperty(name = "annotationAttributeInstances", opposite = "annotationTypeAttribute", derived = true)
  public getAnnotationAttributeInstances(): Set<AnnotationInstanceAttribute> {
    return this.annotationTypeAttributeAnnotationAttributeInstances;
  }

  // manyOne.Setter
  public addAnnotationAttributeInstances(annotationTypeAttributeAnnotationAttributeInstances: AnnotationInstanceAttribute) {
    if (!this.annotationTypeAttributeAnnotationAttributeInstances.has(annotationTypeAttributeAnnotationAttributeInstances)) {
      this.annotationTypeAttributeAnnotationAttributeInstances.add(annotationTypeAttributeAnnotationAttributeInstances);
      annotationTypeAttributeAnnotationAttributeInstances.setAnnotationTypeAttribute(this);
    }
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.AnnotationTypeAttribute", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("annotationAttributeInstances", this.getAnnotationAttributeInstances());

  }

}

