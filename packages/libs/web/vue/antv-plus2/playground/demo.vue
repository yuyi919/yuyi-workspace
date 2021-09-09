<template>
  <div>
    <a-card class="demo-wrap">
      <div class="demo-main">
        <div class="demo-component-wrap" v-if="$slots.demo">
          <slot name="demo"></slot>
        </div>
        <div class="demo-component-wrap" v-else-if="$slots.default">
          <slot></slot>
        </div>
      </div>
      <a-divider
        class="inner"
        style="margin-bottom: 24px"
        v-if="$slots['desc'] || desc"
        orientation="left"
      >
        <span v-if="$slots['desc-title']">
          <slot name="desc-title"></slot>
        </span>
        <span v-else-if="title">{{ title }}</span>
      </a-divider>
      <div style="margin-bottom: 24px">
        <slot v-if="$slots['desc']" name="desc"></slot>
        <span v-else-if="desc">{{ desc }}</span>
      </div>
      <div class="inner" style="margin-bottom: -24px">
        <a-divider style="margin: 0" dashed />
        <a-row type="flex" justify="center">
          <a-col>
            <a-tooltip>
              <template slot="title">codesandbox</template>
              <a-icon class="action-item" type="code-sandbox" />
            </a-tooltip>
            <a-tooltip>
              <template slot="title">代码展示</template>
              <a-icon class="action-item" viewBox="0 0 1024 1024" @click="toggleCode">
                <path
                  v-if="!showCode"
                  d="M1018.64495,531.297637 C1027.27952,512.687401 1023.24618,489.87879 1007.20328,475.433694 L802.095304,290.753647 L802.095304,290.753647 C782.394782,273.015217 752.044514,274.605807 734.306083,294.306329 L734.306083,294.306329 L734.306083,294.306329 C716.567653,314.006852 718.158243,344.35712 737.858766,362.09555 L904.138417,511.81442 L736.858766,662.433694 C717.158243,680.172125 715.567653,710.522392 733.306083,730.222915 C751.044514,749.923438 781.394782,751.514028 801.095304,733.775598 L1006.20328,549.09555 C1011.84552,544.015251 1016.00229,537.90046 1018.64495,531.297643 Z M119.947,511.390231 L286.22665,361.671361 C305.927173,343.932931 307.517763,313.582663 289.779333,293.88214 L289.779333,293.88214 L289.779333,293.88214 C272.040903,274.181618 241.690635,272.591027 221.990112,290.329458 L221.990112,290.329458 L16.8821402,475.009505 C0.839236202,489.454601 -3.19410198,512.263212 5.44046645,530.873448 C8.08312579,537.476271 12.2398959,543.591061 17.8821402,548.671361 L222.990112,733.351408 C242.690635,751.089839 273.040903,749.499248 290.779333,729.798726 C308.517763,710.098203 306.927173,679.747935 287.22665,662.009505 L119.947,511.390231 Z"
                  id="Combined-Shape"
                ></path>
                <path
                  v-else
                  d="M1018.64495,531.297637 C1027.27952,512.687401 1023.24618,489.87879 1007.20328,475.433694 L802.095304,290.753647 C782.394782,273.015217 752.044514,274.605807 734.306083,294.306329 C716.567653,314.006852 718.158243,344.35712 737.858766,362.09555 L904.138417,511.81442 L736.858766,662.433694 C717.158243,680.172125 715.567653,710.522392 733.306083,730.222915 C751.044514,749.923438 781.394782,751.514028 801.095304,733.775598 L1006.20328,549.09555 C1011.84552,544.015251 1016.00229,537.90046 1018.64495,531.297643 Z M119.947,511.390231 L286.22665,361.671361 C305.927173,343.932931 307.517763,313.582663 289.779333,293.88214 C272.040903,274.181618 241.690635,272.591027 221.990112,290.329458 L16.8821402,475.009505 C0.839236202,489.454601 -3.19410198,512.263212 5.44046645,530.873448 C8.08312579,537.476271 12.2398959,543.591061 17.8821402,548.671361 L222.990112,733.351408 C242.690635,751.089839 273.040903,749.499248 290.779333,729.798726 C308.517763,710.098203 306.927173,679.747935 287.22665,662.009505 L119.947,511.390231 Z M649.492098,134.243566 C674.403037,143.310407 687.247217,170.85484 678.180377,195.765779 L436.030115,861.068155 C426.963275,885.979094 399.418842,898.823274 374.507902,889.756434 C349.596963,880.689593 336.752783,853.14516 345.819623,828.234221 L587.969885,162.931845 L587.969885,162.931845 C597.036725,138.020906 624.581158,125.176726 649.492098,134.243566 Z"
                  id="Combined-Shape"
                />
              </a-icon>
            </a-tooltip>
          </a-col>
        </a-row>
      </div>
      <transition name="code-fade">
        <div v-show="showCode" class="inner" style="margin-top: 24px; margin-bottom: -24px">
          <a-divider style="margin: 0" />
          <a-tabs>
            <a-tab-pane
              forceRender
              :tab="config.title"
              v-for="(config, index) in codeNavConfigs"
              :key="index"
            >
              <slot :name="config.slotName"></slot>
            </a-tab-pane>
          </a-tabs>
        </div>
      </transition>
    </a-card>
  </div>
</template>
<script>
import { Card, Tabs, Row, Col, Tooltip, Divider, Icon } from "ant-design-vue";
export default {
  name: "Demo",
  components: {
    ACard: Card,
    ATabs: Tabs,
    ARow: Row,
    ACol: Col,
    ATooltip: Tooltip,
    ADivider: Divider,
    AIcon: Icon,
  },
  props: {
    collapse: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
  },
  data() {
    return {
      showCode: false,
      copied: false,
      codeNavIndex: 0,
      codeNavConfigs: [],
    };
  },
  created() {
    this.showCode = this.collapse;
    this.makeCodeNavConfigs();
  },
  methods: {
    toggleCode() {
      this.showCode = !this.showCode;
    },
    copyCode() {
      const pre = this.$el.querySelectorAll("pre")[this.codeNavIndex];
      pre.setAttribute("contenteditable", "true");
      pre.focus();
      document.execCommand("selectAll", false, null);
      this.copied = document.execCommand("copy");
      pre.removeAttribute("contenteditable");
      setTimeout(() => {
        this.copied = false;
      }, 1000);
    },
    codeNavBtnHandler(i) {
      this.codeNavIndex = i;
    },
    makeCodeNavConfigs() {
      const slots = this.$slots;
      const configs = [];
      let title;
      for (const key in slots) {
        if (key.indexOf("code-") == 0) {
          title = key.replace("code-", "").replace(/^\S/, (s) => s.toUpperCase());
          configs.push({
            title,
            slotName: key,
          });
        }
      }
      this.codeNavConfigs = configs;
    },
  },
};
</script>
<style lang="less">
@a: 1;
.demo-wrap {
  margin: 20px 0;

  .inner {
    margin-left: -24px;
    width: calc(100% + 48px);
    .ant-divider-inner-text {
      margin-bottom: -10px;
      vertical-align: bottom;
    }
  }

  .action-item {
    transition: color 0.3s linear;
    font-size: 20px;
    line-height: 20px;
    height: 20px;
    width: 20px;
    margin: 10px 5px;
    color: #aaa;

    &:hover {
      color: inherit;
    }

    cursor: pointer;
  }

  .ant-tabs-bar.ant-tabs-top-bar {
    text-align: center;
  }
  .ant-tabs {
    overflow: visible;
  }
  .ant-tabs-tabpane {
    margin-top: -16px;

    .line-numbers-mode {
      border-radius: 0;
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.code-fade-enter-active {
  transition: all 0.3s ease;
}

.code-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.code-fade-enter,
.code-fade-leave-to {
  transform: translateY(-6px);
  opacity: 0;
}
</style>

<style lang="less" scoped>
// 清除主题给demo带来的影响
/deep/ th,
/deep/ td {
  border: unset;
}
/deep/ .ant-table table {
  display: table;
  /deep/ tr:nth-child(2n) {
    background: inherit;
  }
}
</style>
