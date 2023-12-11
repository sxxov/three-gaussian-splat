/* eslint-disable eqeqeq */
/* eslint-disable node/no-unsupported-features/node-builtins */
import {GaussianSplatGeometry} from '../geometry/GaussianSplatGeometry';
import * as THREE from 'three';
import {GaussianSplatMaterial} from '../materials/GaussianSplatMaterial';
import {MaskingSphere} from './MaskingSphere';
import {MaskingPlane} from './MaskingPlane';

export class GaussianSplatMesh extends THREE.Mesh<GaussianSplatGeometry, GaussianSplatMaterial> {
  private _maskMeshSphere?: MaskingSphere;
  private _maskMeshPlane?: MaskingPlane;

  constructor(private camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, private url: string, maxSplats = Infinity) {
    const material = new GaussianSplatMaterial(camera, renderer);
    const geometry = new GaussianSplatGeometry(maxSplats);
    super(geometry, material);
    this.rotation.x = Math.PI;
  }

  public async load(loadingManager?: THREE.LoadingManager) {
    return this.geometry.load(this.url, loadingManager);
  }

  private _normal = new THREE.Vector3(0, 0, 1);

  public update() {
    this.updateMatrixWorld(true);
    this.geometry.update(this.camera, this.matrixWorld);
    if (this._maskMeshSphere) {
      this.material.sphereCenter = this._maskMeshSphere.position;
      this.material.sphereRadius = this._maskMeshSphere.scale.x;
    }
    if (this._maskMeshPlane) {
      this._normal.set(0, 0, 1);
      this._normal.applyQuaternion(this._maskMeshPlane.quaternion);
      const planePoint = this._maskMeshPlane.position;
      const planeDistance = -planePoint.dot(this._normal);
      this.material.planeNormal = this._normal;
      this.material.planeDistance = planeDistance;
    }
  }

  public addMaskMesh(object: MaskingSphere | MaskingPlane): this {
    if (object instanceof MaskingPlane) {
      this._maskMeshPlane = object;
    } else if (object instanceof MaskingSphere) {
      this._maskMeshSphere = object;
    } else {
      throw new Error('Invalid mask mesh');
    }
    return super.add(object);
  }
}