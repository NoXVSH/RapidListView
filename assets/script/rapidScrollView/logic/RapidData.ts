import RapidBase from "../base/RapidBase";
import {RapidRollDirection} from "../enum/RapidEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RapidData extends RapidBase {

    // private _rowItemNum: number = 1;
    // public set rowItemNum(val: number) {
    //     this._rowItemNum = val;
    // }
    // public get rowItemNum() {
    //     return this._rowItemNum;
    // }

    public layoutData: RapidLayoutData;

    private content: cc.Node = null;
    private layout: cc.Layout = null;

    private itemDataArray: RapidItemData[] = [];
    private dataArray: any[] = [];

    protected onInit() {
        this.content = this.node.getComponent(cc.ScrollView).content;
        this.layout = this.content.getComponent(cc.Layout);
    }

    updateDataArray(dataArray: any[]) {
        this.dataArray = dataArray;


        let itemNode = this.rapidScrollView.getItemTemplateNode();
        let dataLength = this.dataArray.length;
        let isVertical = this.rapidScrollView.getRollDirectionType() === RapidRollDirection.VERTICAL;

        this.layoutData = {} as RapidLayoutData;

        this.layoutData.itemWidth = isVertical ? itemNode.width : itemNode.height;
        this.layoutData.itemHeight = isVertical ? itemNode.height : itemNode.width;

        this.layoutData.spacingX = isVertical ? this.layout.spacingX : this.layout.spacingY;
        this.layoutData.spacingY = isVertical ? this.layout.spacingY : this.layout.spacingX;

        this.layoutData.paddingHorizontal = isVertical ? this.layout.paddingLeft + this.layout.paddingRight : this.layout.paddingTop + this.layout.paddingBottom;
        this.layoutData.paddingVertical = isVertical ? this.layout.paddingTop + this.layout.paddingBottom : this.layout.paddingLeft + this.layout.paddingRight;

        this.layoutData.paddingHorizontalStart = this.layout.horizontalDirection === cc.Layout.HorizontalDirection.LEFT_TO_RIGHT ? this.layout.paddingLeft : this.layout.paddingRight;
        this.layoutData.paddingVerticalStart = this.layout.verticalDirection === cc.Layout.VerticalDirection.TOP_TO_BOTTOM ? this.layout.paddingTop : this.layout.paddingBottom;

        this.layoutData.contentWidth = isVertical ? this.content.width : this.content.height;
        this.layoutData.rowItemNum = this.layout.type === cc.Layout.Type.GRID ?
            Math.floor((this.layoutData.contentWidth + this.layoutData.spacingX - this.layoutData.paddingHorizontal) /
                (this.layoutData.itemWidth + this.layoutData.spacingX)) : 1;
        this.layoutData.contentHeight =  Math.ceil(dataLength / this.layoutData.rowItemNum) * (this.layoutData.itemHeight + this.layoutData.spacingY) + this.layoutData.paddingVertical - this.layoutData.spacingY;

        this.layoutData.viewHeight = isVertical ? this.node.height : this.node.width;
        this.layoutData.viewHeightNum = Math.ceil((this.layoutData.viewHeight + this.layoutData.spacingY - (isVertical ? this.layout.paddingTop : this.layout.paddingLeft)) / (this.layoutData.itemHeight + this.layoutData.spacingY)) + 1;
        this.layoutData.showItemNum = this.layoutData.rowItemNum * this.layoutData.viewHeightNum;

        this.layoutData.isPositiveDirection = (isVertical && this.layout.verticalDirection === cc.Layout.VerticalDirection.TOP_TO_BOTTOM) ||
            (!isVertical && this.layout.horizontalDirection === cc.Layout.HorizontalDirection.LEFT_TO_RIGHT);
    }

    getDataArray(): any[] {
        return this.dataArray
    }

    getDataLength(): number {
        return this.dataArray.length;
    }

    getData(index: number): any {
        return this.dataArray[index]
    }

    updateData(index: number, data: any) {
        if(this.dataArray[index] === undefined) {
            cc.error(`更新的数据下标溢出！最大下标${this.dataArray.length - 1};传入参数${index}!`);

            return;
        }

        this.dataArray[index] = data;
    }

    getItemData(index: number): RapidItemData {
        if(this.itemDataArray[index]) {

            return this.itemDataArray[index];
        }

        let itemNodeSize = this.rapidScrollView.getItemTemplateNode().getContentSize();
        let isVertical = this.rapidScrollView.getRollDirectionType() === RapidRollDirection.VERTICAL;
        let pox: number, poy: number;

        if(this.layout.type !== cc.Layout.Type.GRID){
            pox = 0;
        }
        else {
            let paddingStart = this.layoutData.paddingHorizontalStart;

            pox = -this.layoutData.contentWidth / 2 + (paddingStart + itemNodeSize.width / 2) +  (this.layout.spacingX + this.layoutData.itemWidth) * (index % this.layoutData.rowItemNum);
            this.layout.horizontalDirection === cc.Layout.HorizontalDirection.RIGHT_TO_LEFT && (pox = -pox)
        }

        poy = this.layoutData.paddingVerticalStart + itemNodeSize.height / 2 + (this.layout.spacingY + this.layoutData.itemHeight) * Math.floor(index / this.layoutData.rowItemNum);
        this.layout.verticalDirection === cc.Layout.VerticalDirection.BOTTOM_TO_TOP && (poy = this.layoutData.contentHeight - poy);


        this.itemDataArray[index] = {
            index: index,
            position: cc.v2(pox, -poy),
            itemData: this.dataArray[index]
        } as RapidItemData;

        return this.itemDataArray[index];
    }
}