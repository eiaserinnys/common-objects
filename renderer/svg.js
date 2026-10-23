import {mesh, mul, transform, point, worldParts} from './geometry.js';

// The lamp's metre geometry and instance transforms are unchanged. Only the
// final projection is SVG, with painter sorting rather than a WebGL depth buffer.
export function svgScene(asset, instances, camera, width, height) {
  const view = mul(transform([0, 0, -camera.distance]),
    mul(transform([0, 0, 0], [camera.pitch, camera.yaw, 0]), transform([0, -.24, 0])));
  const focal = height / (2 * Math.tan(Math.PI / 8));
  const project = v => [width / 2 + focal * v[0] / -v[2], height / 2 - focal * v[1] / -v[2]];
  const xy = v => project(v).map(n => n.toFixed(3)).join(',');
  const layers = [], matrices = worldParts(asset);
  const line = (a, b, color, strokeWidth) => layers.push({
    depth: (a[2] + b[2]) / 2 + .00001,
    svg: `<path d="M${xy(a)}L${xy(b)}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`
  });
  for (let n = -10; n <= 10; n++) {
    const v = n / 10;
    line(point(view, [-1, 0, v]), point(view, [1, 0, v]), '#c9c9bd', .5);
    line(point(view, [v, 0, -1]), point(view, [v, 0, 1]), '#c9c9bd', .5);
  }
  for (const instance of instances) for (const part of asset.parts) {
    const matrix = mul(view, mul(transform(instance.position, instance.rotation, instance.scale), matrices.get(part.id)));
    const geometry = mesh(part.geometry), material = asset.materials[part.material];
    const emission = instance.state.on ? (material.emissionWhenOn || 0) : 0;
    const color = `rgb(${material.color.map(v => Math.round(Math.min(1, v + emission * .3) * 255)).join(',')})`;
    for (let n = 0; n < geometry.triangles.length; n += 9) {
      const vertices = [0, 3, 6].map(k => point(matrix, geometry.triangles.slice(n + k, n + k + 3)));
      layers.push({depth: vertices.reduce((sum, v) => sum + v[2], 0) / 3,
        svg: `<path d="M${vertices.map(xy).join('L')}Z" fill="${color}" stroke="${color}" stroke-width=".3"/>`});
    }
    for (let n = 0; n < geometry.lines.length; n += 6) {
      line(point(matrix, geometry.lines.slice(n, n + 3)), point(matrix, geometry.lines.slice(n + 3, n + 6)), '#29362f', .7);
    }
  }
  return layers.sort((a, b) => a.depth - b.depth).map(layer => layer.svg).join('');
}

export function createRenderer(svg, asset) {
  return {render(instances, camera) {
    const width = svg.clientWidth, height = svg.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = svgScene(asset, instances, camera, width, height);
  }};
}
