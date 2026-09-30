import { describe, it, expect } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { boardFieldOfView } from "../src/games/chess/camera";
describe("Chess camera fits the board", () => {
  for (const aspect of [0.4, 0.55, 1, 1.8, 3.6])
    for (const flip of [1, -1])
      it(
        "all corners visible at aspect " + aspect + " / direction " + flip,
        () => {
          const camera = new PerspectiveCamera(
            boardFieldOfView(aspect),
            aspect,
            0.1,
            100,
          );
          camera.position.set(8 * flip, 11.5, 11 * flip);
          camera.lookAt(0, 0.15, 0);
          camera.updateMatrixWorld();
          for (const x of [-4.4, 4.4])
            for (const z of [-4.4, 4.4])
              for (const y of [-0.3, 1.6]) {
                const projected = new Vector3(x, y, z).project(camera);
                expect(Math.abs(projected.x)).toBeLessThan(1);
                expect(Math.abs(projected.y)).toBeLessThan(1);
              }
        },
      );
});
