import { ShapeReader } from '@shpts/reader/shpReader';
import { CoordType, PolygonCoord } from '@shpts/types/coordinate';
import { BaseRingedRecord } from './base';
import {
    GeoJsonCoord,
    GeoJsonGeom,
    GeoJsonMultiPolygon,
    GeoJsonPolygon,
} from '@shpts/types/geojson';
import { GeomUtil } from '@shpts/utils/geometry';
import { GeomHeader } from '@shpts/types/data';
import { assemblePolygonsWithHoles } from '@shpts/utils/orientation';

export class PolygonRecord extends BaseRingedRecord {
    constructor(public coords: PolygonCoord, coordType: CoordType, hasMValuesPresent: boolean) {
        super(coordType, hasMValuesPresent);
    }

    get type() {
        if (this.coords.length === 1) return 'Polygon';
        return 'MultiPolygon';
    }

    static fromPresetReader(reader: ShapeReader, header: GeomHeader) {
        const hasZ = reader.hasZ;
        const hasOptionalM = reader.hasOptionalM;
        const shpStream = reader.shpStream;
        let z, m;

        PolygonRecord.readBbox(shpStream); //throw away the bbox
        const numParts = shpStream.readInt32(true);
        const numPoints = shpStream.readInt32(true);
        const parts = shpStream.readInt32Array(numParts, true);
        const xy = shpStream.readDoubleArray(numPoints * 2, true);
        if (hasZ) z = PolygonRecord.getZValues(shpStream, numPoints);

        const hasM = !this.recordReadingFinalized(shpStream, header) && hasOptionalM;
        if (hasM) m = PolygonRecord.getMValues(shpStream, numPoints);

        const coords = PolygonRecord.getCoords(parts, xy, z, m);
        const polygons = assemblePolygonsWithHoles(coords);
        return new PolygonRecord(polygons as PolygonCoord, GeomUtil.coordType(header.type), hasM);
    }

    toGeoJson(): GeoJsonGeom {
        const coords = [];
        const sliceParam = this.hasM ? this.coordLength - 1 : this.coordLength;
        for (const polygon of this.coords) {
            const polyCoord = [];
            for (const ring of polygon) {
                const ringCoord = [];
                for (const coord of ring) ringCoord.push(coord.slice(0, sliceParam));
                polyCoord.push(ringCoord);
            }
            coords.push(polyCoord);
        }

        if (coords.length === 1) {
            const geom: GeoJsonPolygon = {
                type: 'Polygon',
                coordinates: coords[0] as GeoJsonCoord[][],
            };
            return geom;
        }

        const geom: GeoJsonMultiPolygon = {
            type: 'MultiPolygon',
            coordinates: coords as GeoJsonCoord[][][],
        };
        return geom;
    }
}
