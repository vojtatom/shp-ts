import { expect, test } from 'vitest';
import { expectGeometry, expectRing, openFileAsArray } from './utils';
import { ShapeReader, PolygonRecord, CoordType } from '@shpts/shpts';

test('Reading PolygonRecord', async () => {
    const shpBuffer = openFileAsArray('testdata/polygon.shp');
    const shxBuffer = openFileAsArray('testdata/polygon.shx');

    const reader = await ShapeReader.fromArrayBuffer(shpBuffer, shxBuffer);

    let geom = expectGeometry(reader, 0, CoordType.XY, PolygonRecord);
    expect(geom.type).toEqual('Polygon');
    expect(geom.coords.length).toBe(1);
    let polygon = geom.coords[0];
    expect(polygon.length).toBe(3);

    expectRing(polygon[0], [
        { x: 100, y: 60 },
        { x: 100, y: -40 },
        { x: -100, y: -40 },
        { x: -100, y: 60 },
        { x: 100, y: 60 },
    ]);

    expectRing(polygon[1], [
        { x: -40, y: 40 },
        { x: -40, y: -10 },
        { x: -10, y: -10 },
        { x: -10, y: 40 },
        { x: -40, y: 40 },
    ]);

    expectRing(polygon[2], [
        { x: 60, y: 40 },
        { x: 35, y: 40 },
        { x: 35, y: -15 },
        { x: 60, y: -15 },
        { x: 60, y: 40 },
    ]);

    geom = expectGeometry(reader, 1, CoordType.XY, PolygonRecord);
    expect(geom.type).toEqual('Polygon');
    expect(geom.coords.length).toBe(1);
    polygon = geom.coords[0];
    expect(polygon.length).toBe(1);
    expectRing(polygon[0], [
        { x: -190, y: 55 },
        { x: -170, y: 55 },
        { x: -140, y: -35 },
        { x: -210, y: -35 },
        { x: -190, y: 55 },
    ]);

    geom = expectGeometry(reader, 2, CoordType.XY, PolygonRecord);
    expect(geom.type).toEqual('MultiPolygon');
    expect(geom.coords.length).toBe(3);
    polygon = geom.coords[0];
    expect(polygon.length).toBe(3);
    expectRing(polygon[0], [
        { x: -149.92383493947585, y: -107.20901451037372 },
        { x: -140.61850329563254, y: -125.81967779806041 },
        { x: -203.09715861858095, y: -141.77167490179193 },
        { x: -258.2644819356524, y: -134.460342895915 },
        { x: -259.59381502763006, y: -109.20301414834012 },
        { x: -149.92383493947585, y: -107.20901451037372 },
    ]);
    expectRing(polygon[1], [
        { x: -211.55262105541485, y: -114.18079693534207 },
        { x: -222.17569209356486, y: -126.02960693943254 },
        { x: -198.47807208538396, y: -125.41673745646227 },
        { x: -211.55262105541485, y: -114.18079693534207 },
    ]);
    expectRing(polygon[2], [
        { x: -254.4534848633285, y: -128.68537469897 },
        { x: -239.54032744438703, y: -128.88966452662675 },
        { x: -241.1746460656409, y: -113.77221728002854 },
        { x: -252.63985750747375, y: -113.16878509887954 },
        { x: -254.4534848633285, y: -128.68537469897 },
    ]);

    polygon = geom.coords[1];
    expect(polygon.length).toBe(1);
    expectRing(polygon[0], [
        { x: -217.05515608434595, y: -92.58635049861982 },
        { x: -263.58181430356285, y: -92.58635049861982 },
        { x: -241.64781828593203, y: -65.33502211307837 },
        { x: -217.05515608434595, y: -92.58635049861982 },
    ]);

    polygon = geom.coords[2];
    expect(polygon.length).toBe(2);
    expectRing(polygon[0], [
        { x: -154.57650076139757, y: -62.01168938313447 },
        { x: -150.58850148546466, y: -95.24501668257506 },
        { x: -190.46849424479345, y: -92.58635049861982 },
        { x: -190.46849424479345, y: -62.67635592912325 },
        { x: -154.57650076139757, y: -62.01168938313447 },
    ]);
    expectRing(polygon[1], [
        { x: -183.15633501112902, y: -68.82845519554763 },
        { x: -183.36062483878575, y: -87.2145396846534 },
        { x: -160.48016414123182, y: -87.2145396846534 },
        { x: -161.2973234518588, y: -68.82845519554763 },
        { x: -183.15633501112902, y: -68.82845519554763 },
    ]);
});

test('Reading PolygonRecord with M', async () => {
    const shpBuffer = openFileAsArray('testdata/polygonM.shp');
    const shxBuffer = openFileAsArray('testdata/polygonM.shx');

    const reader = await ShapeReader.fromArrayBuffer(shpBuffer, shxBuffer);

    expect(reader.recordCount).toBe(2);

    let geom = expectGeometry(reader, 0, CoordType.XYM, PolygonRecord);
    expect(geom.type).toEqual('Polygon');
    expect(geom.coords.length).toBe(1);
    let polygon = geom.coords[0];
    expect(polygon.length).toBe(1);
    expectRing(polygon[0], [
        { x: -70, y: -115, m: 40 },
        { x: -44, y: -115, m: 50 },
        { x: -56, y: -132, m: 60 },
        { x: -70, y: -115, m: 40 },
    ]);

    geom = expectGeometry(reader, 1, CoordType.XYM, PolygonRecord);
    expect(geom.type).toEqual('MultiPolygon');
    expect(geom.coords.length).toBe(3);

    polygon = geom.coords[0];
    expect(polygon.length).toBe(1);
    expectRing(polygon[0], [
        { x: 34.44082552002709, y: -157.7606773230082, m: 5 },
        { x: 23.31626238756462, y: -165.56738829315734, m: 6 },
        { x: 20.97424909651994, y: -153.27181851517253, m: 7 },
        { x: 34.44082552002709, y: -157.7606773230082, m: 5 },
    ]);

    polygon = geom.coords[1];
    expect(polygon.length).toBe(1);
    expectRing(polygon[0], [
        { x: 4, y: -153, m: 1 },
        { x: 2, y: -170, m: 2 },
        { x: -22, y: -168, m: 3 },
        { x: -27, y: -153, m: 4 },
        { x: 4, y: -153, m: 1 },
    ]);

    polygon = geom.coords[2];
    expect(polygon.length).toBe(4);
    expectRing(polygon[0], [
        { x: 21.36458464502732, y: -114.82376698718815, m: 8 },
        { x: 23.511430161818396, y: -145.4651075450234, m: 9 },
        { x: -33.47755992027015, y: -143.1230942539787, m: 10 },
        { x: -29.76937220944933, y: -116.18994140696418, m: 11 },
        { x: 21.36458464502732, y: -114.82376698718815, m: 8 },
    ]);
    expectRing(polygon[1], [
        { x: -10.057427009822845, y: -140.1955776401727, m: 33 },
        { x: -15.131789140419755, y: -131.4130277987549, m: 44 },
        { x: -25.67084895012107, y: -123.60631682860594, m: 55 },
        { x: -28.98870111243434, y: -138.43906767188923, m: 66 },
        { x: -10.057427009822845, y: -140.1955776401727, m: 33 },
    ]);
    expectRing(polygon[2], [
        { x: 8.953915923251884, y: -129.89172001995667, m: NaN },
        { x: 4.580156059206786, y: -138.82940322039667, m: NaN },
        { x: 15.314383643161705, y: -138.82940322039667, m: NaN },
        { x: 9.264182641296316, y: -130.04685337897888, m: NaN },
        { x: 8.953915923251884, y: -129.89172001995667, m: NaN },
    ]);
    expectRing(polygon[3], [
        { x: -11.033265881091495, y: -120.87396798905371, m: 12 },
        { x: -12.5946080751213, y: -130.24202115323266, m: 13 },
        { x: 0.4816327998785255, y: -133.75504108979976, m: 14 },
        { x: 0.8719683483859058, y: -121.8498068603223, m: 15 },
        { x: -10.83809810683772, y: -120.87396798905371, m: 16 },
        { x: -11.033265881091495, y: -120.87396798905371, m: 12 },
    ]);
});

test('Reading PolygonRecord with Z', async () => {
    const shpBuffer = openFileAsArray('testdata/polygonZM.shp');
    const shxBuffer = openFileAsArray('testdata/polygonZM.shx');

    const reader = await ShapeReader.fromArrayBuffer(shpBuffer, shxBuffer);
    expect(reader.recordCount).toBe(2);

    let geom = expectGeometry(reader, 0, CoordType.XYZM, PolygonRecord);
    expect(geom.type).toEqual('Polygon');
    expect(geom.coords.length).toBe(1);

    let polygon = geom.coords[0];
    expect(polygon.length).toBe(1);
    expectRing(polygon[0], [
        { x: 32, y: -86, z: 10, m: 1 },
        { x: 46, y: -86, z: 20, m: NaN },
        { x: 50, y: -100, z: 30, m: 2 },
        { x: 33, y: -101, z: 0, m: NaN },
        { x: 32, y: -86, z: 10, m: 1 },
    ]);

    geom = expectGeometry(reader, 1, CoordType.XYZM, PolygonRecord);
    expect(geom.type).toEqual('MultiPolygon');
    expect(geom.coords.length).toBe(3); //testing only the first polygon bellow

    polygon = geom.coords[0];
    expect(polygon.length).toBe(4);

    expectRing(polygon[0], [
        { x: 84, y: -108, z: 0, m: 5 },
        { x: 86, y: -124, z: 0, m: 6 },
        { x: 72, y: -130, z: 0, m: 7 },
        { x: 61, y: -120, z: 0, m: 8 },
        { x: 67, y: -108, z: 0, m: 9 },
        { x: 84, y: -108, z: 0, m: 5 },
    ]);

    expectRing(polygon[3], [
        { x: 66.83518332201072, y: -116.61642294039177, z: 0, m: NaN },
        { x: 72.99209448485459, y: -118.9252646264581, z: 0, m: NaN },
        { x: 69.42388460638824, y: -111.64891507037015, z: 0, m: NaN },
        { x: 66.83518332201072, y: -116.61642294039177, z: 0, m: NaN },
    ]);

    expectRing(polygon[2], [
        { x: 75.51083086965417, y: -111.78884486952569, z: 0, m: NaN },
        { x: 76.70023416247636, y: -118.43551032941377, z: 0, m: NaN },
        { x: 82.78718042574235, y: -117.80582623321385, z: 0, m: NaN },
        { x: 81.17798773545354, y: -111.71887996994786, z: 0, m: NaN },
        { x: 75.51083086965417, y: -111.78884486952569, z: 0, m: NaN },
    ]);

    expectRing(polygon[1], [
        { x: 73.2019891835879, y: -126.20161418254617, z: 0, m: NaN },
        { x: 75.23097127134315, y: -126.34154398170176, z: 0, m: NaN },
        { x: 77.18998845952069, y: -125.64189498592401, z: 0, m: NaN },
        { x: 78.37939175234271, y: -124.66238639183524, z: 0, m: NaN },
        { x: 78.51932155149831, y: -122.5634394045021, z: 0, m: NaN },
        { x: 77.0500586603651, y: -120.81431691505787, z: 0, m: NaN },
        { x: 74.3214275768322, y: -120.04470301970241, z: 0, m: NaN },
        { x: 71.52283159372138, y: -120.60442221632462, z: 0, m: NaN },
        { x: 70.40339320047707, y: -121.79382550914664, z: 0, m: NaN },
        { x: 70.19349850174376, y: -123.89277249647978, z: 0, m: NaN },
        { x: 71.24297199541036, y: -125.01221088972409, z: 0, m: NaN },
        { x: 73.2019891835879, y: -126.20161418254617, z: 0, m: NaN },
    ]);
});

test('Reading PolygonZ Terrain Example', async () => {
    const shpBuffer = openFileAsArray('testdata/terrain/ter.shp');
    const shxBuffer = openFileAsArray('testdata/terrain/ter.shx');

    const reader = await ShapeReader.fromArrayBuffer(shpBuffer, shxBuffer);
    expect(reader.recordCount).toBe(42798);
});
