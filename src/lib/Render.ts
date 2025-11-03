import {Point} from "./Point";
import {rotateOnAll3Axes, rotatePointOnAll3Axes, rotatePointY, rotateY} from "./Rotate";
import {Vector} from "./Vector";


function dot(a: Vector, b: Vector) {
    return a.x*b.x + a.y*b.y + a.z*b.z;
}

export function render(angleX: number, angleY: number, angleZ: number, shapeProperties: any): string[][] {
    if(shapeProperties.type === 'donut')
        return renderDonut(angleX, angleY, angleZ, shapeProperties)
    else if(shapeProperties.type === 'cube')
        return renderCube(angleX, angleY, angleZ, shapeProperties)
    else if(shapeProperties.type === 'trefoil')
        return renderTrefoilKnot(angleX, angleY, angleZ, shapeProperties)
    else if(shapeProperties.type === 'hyperboloid')
        return renderHyperboloid(angleX, angleY, angleZ, shapeProperties)
    else
        return renderDonut(angleX, angleY, angleZ, shapeProperties)
}

const renderDonut = (A: number, B: number, C: number, shapeProperties: any): string[][] => {
    const lightSourceVector = new Vector(shapeProperties.lightSourceX, shapeProperties.lightSourceY, shapeProperties.lightSourceZ).normalize()
    let distanceOfScreenFromViewer = 200;
    const zDistances: number[][] = [];
    const screen: string[][] = [];

    for (let y = 0; y < shapeProperties.screenHeight; y++) {
        zDistances[y] = new Array(shapeProperties.screenWidth).fill(0);
        screen[y] = new Array(shapeProperties.screenWidth).fill(' ');
    }

    const sinA = Math.sin(A)
    const cosA = Math.cos(A)
    const sinB = Math.sin(B)
    const cosB = Math.cos(B)
    const sinC = Math.sin(C)
    const cosC = Math.cos(C)

    if(lightSourceVector.magnitude === 0) return screen
    for (let alpha = 0; alpha < 2 * Math.PI; alpha += shapeProperties.alphaSpacing) {
        const cosAlpha = Math.cos(alpha);
        const sinAlpha = Math.sin(alpha);
        let x = shapeProperties.donutRadius + shapeProperties.donutThicknessRadius * cosAlpha;
        let y = shapeProperties.donutThicknessRadius * sinAlpha;

        for (let beta = 0; beta < 2 * Math.PI; beta += shapeProperties.betaSpacing) {
            const cosBeta = Math.cos(beta);
            const sinBeta = Math.sin(beta);
            // after y rotation
            let newX = (x*cosBeta*cosB-sinB*(y*sinA+cosA*x*sinBeta))*cosC+sinC*(y*cosA-sinA*x*sinBeta);
            let newY = -(x*cosBeta*cosB-sinB*(y*sinA+cosA*x*sinBeta))*sinC+cosC*(y*cosA-sinA*x*sinBeta);
            let newZ = -sinB*x*cosBeta-cosB*(y*sinA+cosA*x*sinBeta) + shapeProperties.distanceOfDonutFromViewer
            const ooz = 1 / newZ;

            const projectedX = Math.floor(shapeProperties.screenWidth / 2 + newX * distanceOfScreenFromViewer * ooz);
            const projectedY = Math.floor(shapeProperties.screenHeight / 2 - newY * distanceOfScreenFromViewer * ooz);

            if(projectedX < 0 || projectedX >= shapeProperties.screenWidth || isNaN(projectedX)) continue;
            if(projectedY < 0 || projectedY >= shapeProperties.screenHeight || isNaN(projectedY)) continue;

            let newLuminanceX = (cosAlpha*cosBeta*cosB-sinB*(+sinAlpha*sinA+cosA*cosAlpha*sinBeta))*cosC+sinC*(sinAlpha*cosA-sinA*cosAlpha*sinBeta);
            let newLuminanceY = -(cosAlpha*cosBeta*cosB-sinB*(+sinAlpha*sinA+cosA*cosAlpha*sinBeta))*sinC+cosC*(sinAlpha*cosA-sinA*cosAlpha*sinBeta);
            let newLuminanceZ = -sinB*cosAlpha*cosBeta-cosB*(sinAlpha*sinA+cosA*cosAlpha*sinBeta)

            const luminanceProduct = newLuminanceX*lightSourceVector.x+newLuminanceY*lightSourceVector.y+newLuminanceZ*lightSourceVector.z+1;

            if (ooz > zDistances[projectedY][projectedX]) {
                let luminanceIndex = Math.floor(luminanceProduct * 5.9);

                zDistances[projectedY][projectedX] = ooz;
                screen[projectedY][projectedX] = ".,-~:;=!*#$@"[luminanceIndex];
            }
        }
    }
    return screen;
}
const renderCube = (A: number, B: number, C: number, shapeProperties: any): string[][] => {
    const lightSourceVector = new Vector(shapeProperties.lightSourceX, shapeProperties.lightSourceY, shapeProperties.lightSourceZ).normalize()
    const zDistances: number[][] = [];
    const screen: string[][] = [];
    const cubeRadius = shapeProperties.donutRadius * 2.5
    const spacing = shapeProperties.alphaSpacing * 5

    for (let y = 0; y < shapeProperties.screenHeight; y++) {
        zDistances[y] = new Array(shapeProperties.screenWidth).fill(0);
        screen[y] = new Array(shapeProperties.screenWidth).fill(' ');
    }

    const sinA = Math.sin(A)
    const cosA = Math.cos(A)
    const sinB = Math.sin(B)
    const cosB = Math.cos(B)
    const sinC = Math.sin(C)
    const cosC = Math.cos(C)

    let luminances: Vector[] = [
        new Vector(0,0,-1),
        new Vector(0,0,1),
        new Vector(-1,0,0),
        new Vector(1,0,0),
        new Vector(0,-1,0),
        new Vector(0,1,0),
    ];

    if(lightSourceVector.magnitude === 0) return screen
    for (let i = -cubeRadius; i < cubeRadius; i += spacing) {
        for (let j = -cubeRadius; j < cubeRadius; j += spacing) {
            let points: Point[] = [];
            points.push(new Point(i, j, -cubeRadius))
            points.push(new Point(i, j, cubeRadius))
            points.push(new Point(-cubeRadius, i, j))
            points.push(new Point(cubeRadius, i, j))
            points.push(new Point(i, -cubeRadius, j))
            points.push(new Point(i, cubeRadius, j))

            for(let k = 0; k < 6; k++) {
                let x = points[k].x;
                let y = points[k].y;
                let z = points[k].z;

                let newX = cosC*(x*cosB+sinB*(-y*sinA+z*cosA))+sinC*(y*cosA+z*sinA)
                let newY = -sinC*(x*cosB+sinB*(-y*sinA+z*cosA))+cosC*(y*cosA+z*sinA)
                let newZ = -x*sinB + cosB*(-y*sinA+z*cosA)+shapeProperties.distanceOfDonutFromViewer

                const ooz = 1 / newZ;

                const projectedX = Math.floor(shapeProperties.screenWidth / 2 + newX);
                const projectedY = Math.floor(shapeProperties.screenHeight / 2 - newY);

                if(projectedX < 0 || projectedX >= shapeProperties.screenWidth || isNaN(projectedX)) continue;
                if(projectedY < 0 || projectedY >= shapeProperties.screenHeight || isNaN(projectedY)) continue;

                let luminanceX = luminances[k].x;
                let luminanceY= luminances[k].y;
                let luminanceZ= luminances[k].z;

                let newLuminanceX = cosC*(luminanceX*cosB+sinB*(-luminanceY*sinA+luminanceZ*cosA))+sinC*(luminanceY*cosA+luminanceZ*sinA)
                let newLuminanceY = -sinC*(luminanceX*cosB+sinB*(-luminanceY*sinA+luminanceZ*cosA))+cosC*(luminanceY*cosA+luminanceZ*sinA)
                let newLuminanceZ = -luminanceX*sinB+cosB*(-luminanceY*sinA+luminanceZ*cosA)

                let luminanceProduct = newLuminanceX*lightSourceVector.x+newLuminanceY*lightSourceVector.y+newLuminanceZ*lightSourceVector.z+1;

                if (ooz > zDistances[projectedY][projectedX]) {
                    let luminanceIndex = Math.floor(luminanceProduct * 5.9);

                    zDistances[projectedY][projectedX] = ooz;
                    screen[projectedY][projectedX] = ".,-~:;=!*#$@"[luminanceIndex];
                }
            }
        }
    }
    return screen;
}

const renderTrefoilKnot = (A: number, B: number, C: number, shapeProperties: any): string[][] => {
    const lightSourceVector = new Vector(shapeProperties.lightSourceX, shapeProperties.lightSourceY, shapeProperties.lightSourceZ).normalize()
    let distanceOfScreenFromViewer = 200;
    const zDistances: number[][] = [];
    const screen: string[][] = [];
    const tubeRadius = shapeProperties.donutThicknessRadius * 0.5;

    for (let y = 0; y < shapeProperties.screenHeight; y++) {
        zDistances[y] = new Array(shapeProperties.screenWidth).fill(0);
        screen[y] = new Array(shapeProperties.screenWidth).fill(' ');
    }

    const sinA = Math.sin(A)
    const cosA = Math.cos(A)
    const sinB = Math.sin(B)
    const cosB = Math.cos(B)
    const sinC = Math.sin(C)
    const cosC = Math.cos(C)

    if(lightSourceVector.magnitude === 0) return screen

    // Render trefoil knot
    for (let t = 0; t < 2 * Math.PI; t += shapeProperties.alphaSpacing * 0.5) {
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const sin2T = Math.sin(2*t);
        const cos2T = Math.cos(2*t);
        const sin3T = Math.sin(3*t);

        // Trefoil knot centerline parametric equations
        const cx = sinT + 2 * sin2T;
        const cy = cosT - 2 * cos2T;
        const cz = -sin3T;

        // Calculate tangent vector for the knot
        const tx = cosT + 4 * cos2T;
        const ty = -sinT + 4 * sin2T;
        const tz = -3 * Math.cos(3*t);

        // Normalize tangent
        const tMag = Math.sqrt(tx*tx + ty*ty + tz*tz);
        const txNorm = tx / tMag;
        const tyNorm = ty / tMag;
        const tzNorm = tz / tMag;

        // Create a normal vector perpendicular to tangent
        let nx = -tyNorm;
        let ny = txNorm;
        let nz = 0;
        const nMag = Math.sqrt(nx*nx + ny*ny + nz*nz);
        if(nMag > 0) {
            nx /= nMag;
            ny /= nMag;
            nz /= nMag;
        }

        // Create binormal vector
        let bx = tyNorm * nz - tzNorm * ny;
        let by = tzNorm * nx - txNorm * nz;
        let bz = txNorm * ny - tyNorm * nx;

        // Draw tube around the knot
        for (let theta = 0; theta < 2 * Math.PI; theta += shapeProperties.betaSpacing * 1.5) {
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);

            // Point on tube surface
            let x = cx + tubeRadius * (nx * cosTheta + bx * sinTheta);
            let y = cy + tubeRadius * (ny * cosTheta + by * sinTheta);
            let z = cz + tubeRadius * (nz * cosTheta + bz * sinTheta);

            // Surface normal for tube
            let normalX = nx * cosTheta + bx * sinTheta;
            let normalY = ny * cosTheta + by * sinTheta;
            let normalZ = nz * cosTheta + bz * sinTheta;

            // Apply rotations to position
            let newX = cosC*(x*cosB+sinB*(-y*sinA+z*cosA))+sinC*(y*cosA+z*sinA)
            let newY = -sinC*(x*cosB+sinB*(-y*sinA+z*cosA))+cosC*(y*cosA+z*sinA)
            let newZ = -x*sinB + cosB*(-y*sinA+z*cosA)+shapeProperties.distanceOfDonutFromViewer

            const ooz = 1 / newZ;

            const projectedX = Math.floor(shapeProperties.screenWidth / 2 + newX * distanceOfScreenFromViewer * ooz);
            const projectedY = Math.floor(shapeProperties.screenHeight / 2 - newY * distanceOfScreenFromViewer * ooz);

            if(projectedX < 0 || projectedX >= shapeProperties.screenWidth || isNaN(projectedX)) continue;
            if(projectedY < 0 || projectedY >= shapeProperties.screenHeight || isNaN(projectedY)) continue;

            // Apply rotations to normal
            let newLuminanceX = cosC*(normalX*cosB+sinB*(-normalY*sinA+normalZ*cosA))+sinC*(normalY*cosA+normalZ*sinA)
            let newLuminanceY = -sinC*(normalX*cosB+sinB*(-normalY*sinA+normalZ*cosA))+cosC*(normalY*cosA+normalZ*sinA)
            let newLuminanceZ = -normalX*sinB+cosB*(-normalY*sinA+normalZ*cosA)

            const luminanceProduct = newLuminanceX*lightSourceVector.x+newLuminanceY*lightSourceVector.y+newLuminanceZ*lightSourceVector.z+1;

            if (ooz > zDistances[projectedY][projectedX]) {
                let luminanceIndex = Math.floor(luminanceProduct * 5.9);
                zDistances[projectedY][projectedX] = ooz;
                screen[projectedY][projectedX] = ".,-~:;=!*#$@"[luminanceIndex];
            }
        }
    }

    return screen;
}

const renderHyperboloid = (A: number, B: number, C: number, shapeProperties: any): string[][] => {
    const lightSourceVector = new Vector(shapeProperties.lightSourceX, shapeProperties.lightSourceY, shapeProperties.lightSourceZ).normalize()
    let distanceOfScreenFromViewer = 200;
    const zDistances: number[][] = [];
    const screen: string[][] = [];
    const scale = shapeProperties.donutRadius;

    for (let y = 0; y < shapeProperties.screenHeight; y++) {
        zDistances[y] = new Array(shapeProperties.screenWidth).fill(0);
        screen[y] = new Array(shapeProperties.screenWidth).fill(' ');
    }

    const sinA = Math.sin(A)
    const cosA = Math.cos(A)
    const sinB = Math.sin(B)
    const cosB = Math.cos(B)
    const sinC = Math.sin(C)
    const cosC = Math.cos(C)

    if(lightSourceVector.magnitude === 0) return screen

    // Render one-sheet hyperboloid
    for (let u = -2; u < 2; u += shapeProperties.alphaSpacing * 2) {
        const radiusAtU = scale * Math.sqrt(1 + u * u);
        for (let v = 0; v < 2 * Math.PI; v += shapeProperties.betaSpacing * 2) {
            const cosV = Math.cos(v);
            const sinV = Math.sin(v);

            let x = radiusAtU * cosV;
            let y = scale * u;
            let z = radiusAtU * sinV;

            // Calculate surface normal using partial derivatives
            // For hyperboloid: x = sqrt(1+u^2)*cos(v), y = u, z = sqrt(1+u^2)*sin(v)
            const sqrtTerm = Math.sqrt(1 + u * u);
            const dxdu = (u / sqrtTerm) * cosV;
            const dydu = scale;
            const dzdu = (u / sqrtTerm) * sinV;

            const dxdv = -sqrtTerm * sinV;
            const dydv = 0;
            const dzdv = sqrtTerm * cosV;

            // Normal = cross product of partial derivatives
            let normalX = dydu * dzdv - dzdu * dydv;
            let normalY = dzdu * dxdv - dxdu * dzdv;
            let normalZ = dxdu * dydv - dydu * dxdv;

            // Normalize
            const normalMag = Math.sqrt(normalX*normalX + normalY*normalY + normalZ*normalZ);
            if(normalMag > 0) {
                normalX /= normalMag;
                normalY /= normalMag;
                normalZ /= normalMag;
            }

            // Apply rotations to position
            let newX = cosC*(x*cosB+sinB*(-y*sinA+z*cosA))+sinC*(y*cosA+z*sinA)
            let newY = -sinC*(x*cosB+sinB*(-y*sinA+z*cosA))+cosC*(y*cosA+z*sinA)
            let newZ = -x*sinB + cosB*(-y*sinA+z*cosA)+shapeProperties.distanceOfDonutFromViewer

            const ooz = 1 / newZ;

            const projectedX = Math.floor(shapeProperties.screenWidth / 2 + newX * distanceOfScreenFromViewer * ooz);
            const projectedY = Math.floor(shapeProperties.screenHeight / 2 - newY * distanceOfScreenFromViewer * ooz);

            if(projectedX < 0 || projectedX >= shapeProperties.screenWidth || isNaN(projectedX)) continue;
            if(projectedY < 0 || projectedY >= shapeProperties.screenHeight || isNaN(projectedY)) continue;

            // Apply rotations to normal
            let newLuminanceX = cosC*(normalX*cosB+sinB*(-normalY*sinA+normalZ*cosA))+sinC*(normalY*cosA+normalZ*sinA)
            let newLuminanceY = -sinC*(normalX*cosB+sinB*(-normalY*sinA+normalZ*cosA))+cosC*(normalY*cosA+normalZ*sinA)
            let newLuminanceZ = -normalX*sinB+cosB*(-normalY*sinA+normalZ*cosA)

            const luminanceProduct = newLuminanceX*lightSourceVector.x+newLuminanceY*lightSourceVector.y+newLuminanceZ*lightSourceVector.z+1;

            if (ooz > zDistances[projectedY][projectedX]) {
                let luminanceIndex = Math.floor(luminanceProduct * 5.9);
                zDistances[projectedY][projectedX] = ooz;
                screen[projectedY][projectedX] = ".,-~:;=!*#$@"[luminanceIndex];
            }
        }
    }

    return screen;
}