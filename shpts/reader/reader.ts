import { MultiPointRecord } from '@shpts/geometry/multipoint';
import { ShpNullGeom } from '@shpts/geometry/null';
import { PointRecord } from '@shpts/geometry/point';
import { PolygonRecord } from '@shpts/geometry/polygon';
import { PolyLineRecord } from '@shpts/geometry/polyline';
import { GeomUtil, ShapeType } from '@shpts/utils/geometry';
import { BoundingBox, GeomHeader, PartsInfo, ShpHeader } from '@shpts/types/data';
import { MemoryStream } from '@shpts/utils/stream';
import { MultiPatchRecord } from '@shpts/geometry/multipatch';

export class ShapeReader {
    private shxStream_: MemoryStream;
    private shpStream_: MemoryStream;
    private shxHeader_: ShpHeader;
    private shpHeader_: ShpHeader;

    readonly recordCount: number = 0;
    readonly hasZ: boolean;
    readonly hasM: boolean;

    get extent(): BoundingBox {
        return this.shpHeader_.extent;
    }

    get shapeType(): ShapeType {
        return this.shpHeader_.type;
    }

    get shpHeader(): ShpHeader {
        return this.shpHeader_;
    }

    get shpStream() {
        return this.shpStream_;
    }

    get shxStream() {
        return this.shxStream_;
    }

    private constructor(shp: ArrayBuffer, shx: ArrayBuffer) {
        this.shpStream_ = new MemoryStream(shp);
        this.shpHeader_ = this.readHeader(this.shpStream_);
        this.shxStream_ = new MemoryStream(shx);
        this.shxHeader_ = this.readHeader(this.shxStream_);

        if (this.shpHeader_.type !== this.shxHeader_.type)
            throw new Error('SHP / SHX shapetype mismatch');

        this.recordCount = (this.shxHeader_.fileLength - 100) / 8;
        this.hasZ = GeomUtil.hasZ(this.shpHeader.type);
        this.hasM = GeomUtil.hasM(this.shpHeader.type);
    }

    static async fromFile(shp: File, shx: File) {
        const shpBytes = await shp.arrayBuffer();
        const shxBytes = await shx.arrayBuffer();
        return this.fromArrayBuffer(shpBytes, shxBytes);
    }

    static async fromArrayBuffer(shpBytes: ArrayBuffer, shxBytes: ArrayBuffer) {
        return new ShapeReader(shpBytes, shxBytes);
    }

    private readHeader(stream: MemoryStream): ShpHeader {
        const fileCode = stream.seek(0).readInt32(false);

        if (fileCode !== 9994) {
            throw new Error(`Unexpected Shape fileCode: ${fileCode}`);
        }

        const fileLen = stream.seek(24).readInt32(false);
        const shpType = stream.seek(32).readInt32(true);
        stream.seek(36);
        const extent = this.readBbox(stream);
        const result = {
            type: shpType as ShapeType,
            fileLength: fileLen * 2,
            extent: extent,
        };
        return result;
    }

    private readGeomHeader(): GeomHeader {
        const recNum = this.shpStream_.readInt32(false);
        const len = this.shpStream_.readInt32(false);
        const type: ShapeType = this.shpStream_.readInt32(true) as ShapeType;
        return {
            length: len,
            recordNum: recNum,
            type: type,
        };
    }

    private readBbox(stream: MemoryStream): BoundingBox {
        const xMin = stream.readDouble(true);
        const yMin = stream.readDouble(true);
        const xMax = stream.readDouble(true);
        const yMax = stream.readDouble(true);
        return {
            xMin: xMin,
            yMin: yMin,
            xMax: xMax,
            yMax: yMax,
        };
    }

    private getShpIndex(index: number): number {
        const offs = index * 8 + 100;
        const shpOffset = this.shxStream_.seek(offs).readInt32(false) * 2;
        return shpOffset;
    }

    readGeom(geomIndex: number) {
        const offset = this.getShpIndex(geomIndex);
        this.shpStream_.seek(offset);
        const recHead = this.readGeomHeader();

        this.checkForNull(recHead);

        switch (recHead.type) {
            case ShapeType.Null:
                return new ShpNullGeom();

            case ShapeType.Point:
            case ShapeType.PointZ:
            case ShapeType.PointM:
                return this.readPoint(recHead);

            case ShapeType.MultiPoint:
            case ShapeType.MultiPointZ:
            case ShapeType.MultiPointM:
                return this.readMultiPoint(recHead);

            case ShapeType.PolyLine:
            case ShapeType.PolyLineZ:
            case ShapeType.PolyLineM:
                return this.readPolyLine(recHead);

            case ShapeType.Polygon:
            case ShapeType.PolygonZ:
            case ShapeType.PolygonM:
                return this.readPolygon(recHead);

            case ShapeType.MultiPatch:
                return this.readMultiPatch(recHead);
        }

        throw new Error('Unsupported geometry');
    }

    private checkForNull(recHead: GeomHeader) {
        if (this.shpHeader.type !== recHead.type) {
            if (recHead.type !== ShapeType.Null)
                throw new Error(
                    `Unexpected shape type ${GeomUtil.shapeTypeStr(recHead.type)}(${
                        recHead.type as number
                    }), expected ${GeomUtil.shapeTypeStr(this.shpHeader.type)}`
                );
        }
    }

    private readPoint(header: GeomHeader) {
        return PointRecord.fromPresetReader(this, header);
    }

    private readMultiPoint(header: GeomHeader) {
        return MultiPointRecord.fromPresetReader(this, header);
    }

    private readPolyLine(header: GeomHeader) {
        return PolyLineRecord.fromPresetReader(this, header);
    }

    private readPolygon(header: GeomHeader) {
        return PolygonRecord.fromPresetReader(this, header);
    }

    private readMultiPatch(header: GeomHeader) {
        return MultiPatchRecord.fromPresetReader(this, header);
    }
}
