import { defineComponent } from "vue-demi2";
import { SmartGrid, GridColumn } from "../../src";
import Demo from "../demo.vue";

const Cell: any = defineComponent({
  setup(_, context) {
    return () => {
      return (
        <a-input />
      );
    };
  },
});
export const GridDemo = defineComponent({
  setup() {
    return () => {
      const grids = (
        <div>
          <p>maxColumns 3 + minColumns 2</p>
          <SmartGrid maxColumns={3} minColumns={2}>
            <GridColumn gridSpan={4}>
              <Cell>1</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>2</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>3</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>4</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>5</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>6</Cell>
            </GridColumn>
          </SmartGrid>
          <p>maxColumns 3</p>
          <SmartGrid maxColumns={3}>
            <GridColumn gridSpan={2}>
              <Cell>1</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>2</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>3</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>4</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>5</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>6</Cell>
            </GridColumn>
          </SmartGrid>
          <p>minColumns 2</p>
          <SmartGrid minColumns={2}>
            <GridColumn gridSpan={2}>
              <Cell>1</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>2</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>3</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>4</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>5</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>6</Cell>
            </GridColumn>
          </SmartGrid>
          <p>Null</p>
          <SmartGrid>
            <GridColumn gridSpan={2}>
              <Cell>1</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>2</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>3</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>4</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>5</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>6</Cell>
            </GridColumn>
          </SmartGrid>
          <p>minWidth 150 +maxColumns 3</p>
          <SmartGrid minWidth={150} maxColumns={3}>
            <GridColumn gridSpan={2}>
              <Cell>1</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>2</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>3</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>4</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>5</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>6</Cell>
            </GridColumn>
          </SmartGrid>
          <p>maxWidth 120+minColumns 2</p>
          <SmartGrid maxWidth={120} minColumns={2}>
            <GridColumn gridSpan={2}>
              <Cell>1</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>2</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>3</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>4</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>5</Cell>
            </GridColumn>
            <GridColumn>
              <Cell>6</Cell>
            </GridColumn>
          </SmartGrid>
        </div>
      );
      return (
        <Demo title="测试" desc="测试">
          {grids}
        </Demo>
      );
    };
  },
});
