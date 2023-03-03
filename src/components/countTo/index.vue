<script lang="ts" name="index" setup>
import { onMounted, onUnmounted, reactive, watch, computed } from "vue"
import { requestAnimationFrame, cancelAnimationFrame } from './animationFrame'

// 组件参数
const props = withDefaults(defineProps<{
  startVal?: number // 开始数字 默认 0
  endVal?: number // 结束数字 默认 2022
  duration?: number // 动画时间 默认 3000毫秒
  autoPlay?: boolean // 自动播放 默认 true
  decimals?: number // 保留小数位 默认不保留
  decimal?: string // 小数点
  separator?: string // 分隔符
  prefix?: string // 前缀
  suffix?: string // 后缀
  useEasing?: boolean // 使用缓和动画
  easingFn?: (t: number, b: number, c: number, d: number) => any // 缓和动画函数 
}>(), {
  startVal: 0,
  endVal: 2022,
  duration: 3000,
  autoPlay: true,
  decimals: 0,
  decimal: '.',
  separator: ',',
  prefix: '',
  suffix: '',
  useEasing: true,
  easingFn: (t: number, b: number, c: number, d: number) => (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b
})

const isNumber = (val: string) => !isNaN(parseFloat(val))

// 格式化数据，返回想要展示的数据格式
const formatNumber = (num: number) => {
  const params = `${num.toFixed(props.decimals)}`
  const x = params.split('.')
  let x1 = x[0]
  const x2 = x.length > 1 ? `${props.decimal}${x[1]}` : ''
  const rgx = /(\d+)(\d{3})/

  if (props.separator && !isNumber(props.separator)) {
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + props.separator + '$2')
    }
  }

  return props.prefix + x1 + x2 + props.suffix
}

const state = reactive({
  localStart: props.startVal,
  displayValue: formatNumber(props.startVal),
  printVal: 0,
  paused: false,
  localDuration: props.duration,
  startTime: 0,
  timestamp: 0,
  remaining: 0,
  rAF: null,
})

// 定义一个计算属性，当开始数字大于结束数字时返回true
const stopCount = computed((): boolean => props.startVal > props.endVal)

// 定义父组件的自定义事件，子组件以触发父组件的自定义事件
const emits = defineEmits(['onMountedcallback', 'callback'])


const start = () => {
  state.localStart = props.startVal
  state.startTime = 0
  state.localDuration = props.duration
  state.paused = false
  state.rAF = requestAnimationFrame(count)
}

// 恢复计数
const resume = () => {
  state.startTime = 0
  state.localDuration = +state.remaining
  state.localStart = +state.printVal
  requestAnimationFrame(count)
}

// 暂停计数
const pause = () => {
  cancelAnimationFrame(state.rAF)
}

// 暂停重新计数
const pauseResume = () => {
  if (state.paused) {
    resume()
    state.paused = false
  } else {
    pause()
    state.paused = true
  }
}

// 重置
const reset = () => {
  state.startTime = 0
  cancelAnimationFrame(state.rAF)
  state.displayValue = formatNumber(props.startVal)
}

const count = (timestamp: number) => {
  if (!state.startTime) state.startTime = timestamp
  state.timestamp = timestamp
  const progress: number = timestamp - state.startTime
  state.remaining = state.localDuration - progress
  // 是否使用速度变化曲线
  if (props.useEasing) {
    if (stopCount.value) {
      state.printVal =
        state.localStart -
        props.easingFn(
          progress,
          0,
          state.localStart - props.endVal,
          state.localDuration
        );
    } else {
      state.printVal = props.easingFn(
        progress,
        state.localStart,
        props.endVal - state.localStart,
        state.localDuration
      );
    }
  } else {
    if (stopCount.value) {
      state.printVal =
        state.localStart -
        (state.localStart - props.endVal) * (progress / state.localDuration);
    } else {
      state.printVal =
        state.localStart +
        (props.endVal - state.localStart) * (progress / state.localDuration);
    }
  }
  if (stopCount.value) {
    state.printVal = state.printVal < props.endVal ? props.endVal : state.printVal;
  } else {
    state.printVal = state.printVal > props.endVal ? props.endVal : state.printVal;
  }

  state.displayValue = formatNumber(state.printVal);
  if (progress < state.localDuration) {
    state.rAF = requestAnimationFrame(count);
  } else {
    emits("callback");
  }
}

watch(
  () => props.startVal,
  () => {
    if (props.autoPlay) start()
  }
)

watch(
  () => props.endVal,
  () => {
    if (props.autoPlay) start()
  }
)

onMounted(() => {
  if(props.autoPlay) start()
  emits("onMountedcallback")
})

// 组件销毁时取消动画
onUnmounted(() => {
  cancelAnimationFrame(state.rAF)
})

</script>

<template>
  {{ state.displayValue }}
</template>
