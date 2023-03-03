<script lang="ts" name="newCoronavirus" setup>
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import chinaJSON from '@/assets/json/china.json'
import { nextTick, onMounted, ref, watchEffect } from 'vue'
import { getOverall, getProvinceDataList, getDailyList } from '@/api/covid19'

const theme = ref<string>('dark')
const screenWidth = ref<number>(0)


const overallData = ref<any>({})
const proportionData = ref<any>({})
const fetchOverall = async () => {
  const res = await getOverall()
  overallData.value = res.data

  // 占比数据
  proportionData.value = {
    currentDiagnoseName: '现有确诊',
    currentDiagnoseValue: ((overallData.value.currentConfirmedCount / overallData.value.confirmedCount) * 100).toFixed(0),
    overseasInputName: '境外输入',
    overseasInputValue: ((overallData.value.importedCount / overallData.value.confirmedCount) * 100).toFixed(0),
    countCureName: '累计治愈',
    countCureValue: ((overallData.value.curedCount / overallData.value.confirmedCount) * 100).toFixed(0)
  }
}

// 全国各省数据
const provinceList = ref<any>([])
const mapList = ref<any>([])
const topTenList = ref<any>([])
const fetchProvinceDataList = async () => {
  const res = await getProvinceDataList()
  
  console.log(res.data)
  provinceList.value = res.data.sort((a: any, b: any) => b.confirmedCount - a.confirmedCount)
  console.log(provinceList.value)
  // 地图数据
  mapList.value = provinceList.value.map(({ provinceLabel, confirmedCount }: any) => ({ name: provinceLabel, value: confirmedCount }))
  // 前十数据
  topTenList.value = provinceList.value.splice(0, 10)
}

// 每日数据
const dailyData = ref<any>({})
const fetchDailyList = async () => {
  const res = await getDailyList()
  dailyData.value = res.data
}



const rankingRef = ref()
const rankingBar = () => {
  const rankingName: string[] = topTenList.value.map((item: any) => item.provinceLabel)
  const rankingValue: number[] = topTenList.value.map((item: any) => item.confirmedCount)

  if (rankingRef.value === null) return
  echarts.dispose(rankingRef.value)

  const myChart = echarts.init(rankingRef.value, theme.value, { renderer: 'svg' })
  myChart.setOption({
    backgroundColor: 'transparent',
    grid: {
      top: 0,
      right: '2%',
      bottom: 0,
      left: '2%',
      containLabel: true
    },
    xAxis: {
      show: false,
      type: 'value'
    },
    yAxis: [
      {
        type: 'category',
        inverse: true,
        axisLabel: {
          color: '#fff',
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        data: rankingName
      },
      {
        type: 'category',
        inverse: true,
        axisTick: 'none',
        axisLine: 'none',
        show: true,
        axisLabel: {
          color: '#fff',
          fontSize: '12'
        },
        data: rankingValue
      }
    ],
    series: [
      {
        name: '累计排名',
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: '#1a1f45',
          borderRadius: 30
        },
        itemStyle: {
          borderRadius: 30,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
            offset: 0,
            color: '#1094ff'
          }, {
            offset: 1,
            color: '#6c4dfc'
          }]),
        },
        barWidth: 16,
        data: rankingValue
      }
    ]
  })
}

const proportionRef = ref()
const proportionPie = () => {
  const placeHolderStyle = {
    label: { show: false },
    labelLine: { show: false },
    color: 'transparent',
    borderWidth: 0
  }
  const dataStyle = {
    position: 'center',
    fontSize: 16,
    color: '#fff'
  }

  if (proportionRef.value === null) return
  echarts.dispose(proportionRef.value)

  const myChart = echarts.init(proportionRef.value, theme.value, { renderer: 'svg' })
  myChart.setOption({
    backgroundColor: 'transparent',
    title: [
      {
        text: proportionData.currentDiagnoseName,
        left: '14%',
        top: '80%',
        textAlign: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 14,
          textAlign: 'center'
        }
      },
      {
        text: proportionData.overseasInputName,
        left: '49%',
        top: '80%',
        textAlign: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 14,
          textAlign: 'center'
        }
      },
      {
        text: proportionData.countCureName,
        left: '84%',
        top: '80%',
        textAlign: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 14,
          textAlign: 'center'
        }
      }
    ],
    series: [
      {
        type: 'pie',
        emphasis: { scale: false },
        radius: ['75%', '95%'],
        center: ['18%', '50%'],
        startAngle: 225,
        labelLine: { show: false },
        label: { show: false },
        data: [
          {
            value: 100,
            itemStyle: { color: '#1a1f45', borderRadius: 30 },
          },
          {
            value: 35,
            itemStyle: placeHolderStyle,
          }
        ]
      },
      {
        type: 'pie',
        emphasis: { scale: false },
        radius: ['75%', '95%'],
        center: ['18%', '50%'],
        startAngle: 225,
        labelLine: { show: false },
        label: { ...dataStyle, formatter: `${proportionData.value.currentDiagnoseValue}%` },
        data: [
          {
            value: proportionData.value.currentDiagnoseValue,
            itemStyle: {
              borderRadius: 30,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                offset: 0,
                color: '#fb886b'
              }, {
                offset: 1,
                color: '#d6365c'
              }])
            },
          },
          {
            value: 135 - proportionData.value.currentDiagnoseValue,
            itemStyle: placeHolderStyle,
          }
        ]
      },
      {
        type: 'pie',
        emphasis: { scale: false },
        radius: ['75%', '95%'],
        center: ['50%', '50%'],
        startAngle: 225,
        labelLine: { show: false },
        label: { show: false },
        data: [
          {
            value: 100,
            itemStyle: { color: '#1a1f45', borderRadius: 30 }
          },
          {
            value: 35,
            itemStyle: placeHolderStyle,
          }
        ]
      },
      {
        type: 'pie',
        emphasis: { scale: false },
        radius: ['75%', '95%'],
        center: ['50%', '50%'],
        startAngle: 225,
        labelLine: { show: false },
        label: { ...dataStyle, formatter: `${proportionData.value.overseasInputValue}%` },
        data: [
          {
            value: proportionData.value.overseasInputValue,
            itemStyle: {
              borderRadius: 30,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                offset: 0,
                color: '#fb886b'
              }, {
                offset: 1,
                color: '#d6365c'
              }])
            }
          },
          {
            value: 135 - proportionData.value.overseasInputValue,
            itemStyle: placeHolderStyle,
          }
        ]
      },
      {
        type: 'pie',
        emphasis: { scale: false },
        radius: ['75%', '95%'],
        center: ['82%', '50%'],
        startAngle: 225,
        labelLine: { show: false },
        label: { show: false },
        data: [
          {
            value: 100,
            itemStyle: { color: '#1a1f45', borderRadius: 30 }
          },
          {
            value: 35,
            itemStyle: placeHolderStyle,
          },
        ]
      },
      {
        type: 'pie',
        emphasis: { scale: false },
        radius: ['75%', '95%'],
        center: ['82%', '50%'],
        startAngle: 225,
        labelLine: { show: false },
        label: { ...dataStyle, formatter: `${proportionData.value.countCureValue}%` },
        data: [
          {
            value: proportionData.value.countCureValue,
            itemStyle: {
              borderRadius: 30,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                offset: 0,
                color: '#fb886b'
              }, {
                offset: 1,
                color: '#d6365c'
              }])
            }
          },
          {
            value: 135 - proportionData.value.countCureValue,
            itemStyle: placeHolderStyle,
          },
        ]
      },
    ]
  })
}

const cureRef = ref()
const cureBar = () => {
  const xData = dailyData.value.confirmedCountList.map((item: any) => item[0]).splice(0, 7)
  const diagnoseValue = dailyData.value.confirmedCountList.map((item: any) => item[1]).splice(0, 7)
  const cureValue = dailyData.value.curedCountList.map((item: any) => item[1]).splice(0, 7)


  if (cureRef.value === null) return
  echarts.dispose(cureRef.value)

  const myChart = echarts.init(cureRef.value, theme.value, { renderer: 'svg' })
  myChart.setOption({
    backgroundColor: 'transparent',
    legend: {
      right: 0
    },
    grid: {
      top: '10%',
      right: 0,
      bottom: '2%',
      left: '2%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { color: '#203345' } },
        axisLabel: { rotate: 30 },
        data: xData,
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { color: '#203345' } },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '累计治愈',
        type: 'bar',
        itemStyle: {
          borderRadius: 30,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#7e81d9'
          }, {
            offset: 1,
            color: '#42aae9'
          }]),
        },
        barWidth: 14,
        data: cureValue
      },
      {
        name: '累计诊断',
        type: 'bar',
        barGap: '-100%',
        z: 1,
        itemStyle: {
          borderRadius: 30,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#43279d'
          }, {
            offset: 1,
            color: '#1c1e3e'
          }]),
        },
        barWidth: 14,
        data: diagnoseValue
      }
    ]
  })
}

const mapRef = ref()
const chinaMap = () => {
  if (mapRef.value === null) return
  echarts.dispose(mapRef.value)

  const myChart = echarts.init(mapRef.value, theme.value, { renderer: 'svg' })
  echarts.registerMap('china', chinaJSON as any)
  myChart.setOption({
    backgroundColor: 'transparent',
    visualMap: {
      left: 'left',
      pieces: [
        { min: 1500, label: '>1500人', color: '#39026b' },
        { min: 500, max: 1500, label: '500-1500人', color: '#210068' },
        { min: 200, max: 500, label: '200-500人', color: '#131c93' },
        { min: 100, max: 200, label: '100-200人', color: '#1444a6' },
        { min: 0, max: 100, label: '<100人', color: '#1769c1' },
      ],
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      label: {
        show: true,
        color: '#ccc',
        fontSize: 12,
      },
      itemStyle: {
        areaColor: '#fbfbfb',
        borderColor: '#3399ff'
      },
      select: {
        label: {
          show: true,
          color: '#fff'
        },
        itemStyle: {
          areaColor: '#CC9933',
          shadowColor: 'rgba(51, 153, 255, .4)',
          shadowBlur: 16

        }
      },
      emphasis: {
        label: {
          show: true,
          color: '#fff'
        },
        itemStyle: {
          areaColor: '#CC9933',
          shadowColor: 'rgba(51, 153, 255, .4)',
          shadowBlur: 16
        }
      },
    },
    series: [
      {
        name: "全国确诊新冠肺炎病例",
        type: 'map',
        geoIndex: 0,
        data: mapList.value
      }
    ]
  })
}

const cureDeathRef = ref()
const cureDeathLiquidFill = () => {
  const cureRate = overallData.value.curedRate
  const deathRate = overallData.value.deadRate

  const labelParams = {
    formatter: (params: any): string => {
      return `{ratio|${params.value * 100}%}\n{name|${params.seriesName}}`
    },
    rich: {
      name: {
        fontSize: '14px',
        color: '#fff',
        lineHeight: 30
      },
      ratio: {
        fontSize: '18px',
        color: '#fff',
        fontWeight: 600
      }
    }
  }

  if (cureDeathRef.value === null) return
  echarts.dispose(cureDeathRef.value)

  const myChart = echarts.init(cureDeathRef.value, theme.value, { renderer: 'svg' })
  myChart.setOption({
    backgroundColor: 'transparent',
    series: [
      {
        type: 'liquidFill',
        name: '治愈率',
        radius: '80%',
        center: ['25%', '50%'],
        data: [cureRate, cureRate],
        label: labelParams,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#18cccb'
          }, {
            offset: 1,
            color: '#00003f'
          }]),
        },
        backgroundStyle: {
          borderWidth: 0,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#157eff'
          }, {
            offset: 1,
            color: '#00003f'
          }]),
        },
        outline: {
          borderDistance: 0,
          itemStyle: {
            borderWidth: 6,
            borderColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#10152b'
            }, {
              offset: 1,
              color: '#30309a'
            }]),
          },
        },
      },
      {
        type: 'liquidFill',
        name: '死亡率',
        radius: '80%',
        center: ['75%', '45%'],
        color: [
          {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#2aa1e3',
              },
              {
                offset: 1,
                color: '#08bbc9',
              },
            ],
            globalCoord: false,
          },
        ],
        data: [deathRate, deathRate],
        label: labelParams,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#18cccb'
          }, {
            offset: 1,
            color: '#00003f'
          }]),
        },
        backgroundStyle: {
          borderWidth: 0,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#157eff'
          }, {
            offset: 1,
            color: '#00003f'
          }]),
        },
        outline: {
          borderDistance: 0,
          itemStyle: {
            borderWidth: 6,
            borderColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: '#10152b'
            }, {
              offset: 1,
              color: '#30309a'
            }]),
          },
        },
      },
    ],
  })
}

const addRef = ref()
const addLine = () => {
  const timeData = dailyData.value.currentConfirmedCountList.map((item: any) => item[0])
  const currentAdd = dailyData.value.currentConfirmedCountList.map((item: any) => item[1])
  const overseasAdd = dailyData.value.importedCountList.map((item: any) => item[1])
  const noSymptom = dailyData.value.noInFectCountList.map((item: any) => item[1])

  if (addRef.value === null) return
  echarts.dispose(addRef.value)

  const myChart = echarts.init(addRef.value, theme.value, { renderer: 'svg' })
  myChart.setOption({
    backgroundColor: 'transparent',
    legend: {
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 10,
      right: 0,
      textStyle: {
        fontSize: 12
      },
      data: ['现有确诊新增', '境外输入新增', '无症状感染者']
    },
    grid: {
      top: '12%',
      right: 0,
      bottom: '4%',
      left: '2%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { show: true, lineStyle: { color: '#666' } },
        axisLabel: { rotate: 30 },
        data: timeData
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        type: 'line',
        name: '现有确诊新增',
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2 },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
            offset: 0,
            color: '#c34f27'
          }, {
            offset: 1,
            color: '#f1d443'
          }])
        },
        areaStyle: {
          opacity: 0.2,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#c34f27'
          }, {
            offset: 1,
            color: 'transparent'
          }])
        },
        emphasis: { focus: 'series' },
        data: currentAdd
      },
      {
        type: 'line',
        name: '境外输入新增',
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2 },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
            offset: 0,
            color: '#0072e3'
          }, {
            offset: 1,
            color: '#4001ba'
          }])
        },
        areaStyle: {
          opacity: 0.2,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#005bb6'
          }, {
            offset: 1,
            color: 'transparent'
          }])
        },
        emphasis: { focus: 'series' },
        data: overseasAdd
      },
      {
        type: 'line',
        name: '无症状感染者',
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2 },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
            offset: 0,
            color: '#006aff'
          }, {
            offset: 1,
            color: '#01edfd'
          }])
        },
        areaStyle: {
          opacity: 0.2,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#409eff'
          }, {
            offset: 1,
            color: 'transparent'
          }])
        },
        emphasis: { focus: 'series' },
        data: noSymptom
      },
    ]
  })
}

interface ColsProps {
  label: string,
  prop: string,
  [x: string]: any
}

const cols: ColsProps[] = [
  { label: '省份', prop: 'provinceLabel' },
  { label: '累计确诊', prop: 'confirmedCount' },
  { label: '累计治愈', prop: 'curedCount' },
  { label: '累计死亡', prop: 'deadCount' },
]

onMounted(async () => {
  // 接口数据加载完成，再执行下面的方法
  await fetchOverall()
  await fetchProvinceDataList()
  await fetchDailyList()

  window.onresize = () => {
    return (() => {
      screenWidth.value = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    })()
  }

  nextTick(() => {
    rankingBar()
    proportionPie()

    cureBar()
    chinaMap()

    cureDeathLiquidFill()
    addLine()
  })
})

// 自动监听 `screenWidth.value` 的变化
watchEffect(() => {
  if (screenWidth.value) {
    rankingBar()
    proportionPie()

    cureBar()
    chinaMap()

    cureDeathLiquidFill()
    addLine()
  }
})

</script>

<template>
  <div class="pages">

    <div class="header header_item aic grid_cols_item-24 grid_rows_item-1">
      <div class="header_infos grid_cols_item-6"></div>
      <h2 class="title header_title grid_cols_item-12 flex jcc aic">全国新冠肺炎疫情数据大屏</h2>
      <div class="header_time update_time grid_cols_item-6">
        <span class="desc flex jfe">此数据为真实数据，数据来源：腾讯新闻</span>
        <span class="desc flex jfe">更新时间：{{ overallData.updateTime }}</span>
      </div>
    </div>

    <!-- 排名 -->
    <div class="ranking_item modules grid_cols_item-5 grid_rows_item-10">
      <h3 class="item_title">累计排名（TOP10）</h3>
      <div ref="rankingRef" id="ranking" class="chartItem" />
    </div>

    <!-- 面板 -->
    <ul class="count_list grid_cols_item-13 grid_rows_item-2">
      <li v-for="(item, index) in overallData.list" :key="index" class="count_num_item grid_cols_item-1 modules">
        <p class="info flex jcc aic" :class="item.num > 0 ? 'top' : 'bottom'">
          <span class="text">{{ item.name }}</span>
          <el-icon class="icon" :class="item.num > 0 ? 'top' : 'bottom'">
            <component :is="item.num > 0 ? 'CaretTop' : 'CaretBottom'" />
          </el-icon>
          <span class="num"> {{ item.num }}</span>
        </p>
        <p class="count flex jcc aic" :class="item.countColor">
          <CountTo :endVal="item.count" />
        </p>
      </li>
    </ul>

    <div class="treatment_death_item modules grid_cols_item-6 grid_rows_item-5">
      <h3 class="item_title">治疗率和死亡率</h3>
      <div id="cureDeath" ref="cureDeathRef" class="chartItem" />
    </div>

    <div class="map_item modules_nobg grid_cols_item-13 grid_rows_item-21">
      <div id="map" ref="mapRef" class="chartItem" />
    </div>

    <div class="add_item modules grid_cols_item-6 grid_rows_item-8">
      <h3 class="item_title">新增趋势</h3>
      <div id="add" ref="addRef" class="chartItem" />
    </div>

    <div class="proportion_item modules grid_cols_item-5 grid_rows_item-4">
      <h3 class="item_title">占比</h3>
      <div id="proportion" ref="proportionRef" class="chartItem" />
    </div>

    <div class="provinces_count_treatment_item modules grid_cols_item-6 grid_rows_item-10">
      <h3 class="item_title">各省累计确诊</h3>
      <el-table class="modules_table" ref="tableRef" :data="provinceList">
        <el-table-column type="index" label="排序" :width="60" />
        <el-table-column v-for="item in cols" :key="item.prop" :label="item.label" :prop="item.prop"
          :width="item.width" />
      </el-table>
    </div>

    <div class="latest_week_cure modules grid_cols_item-5 grid_rows_item-9">
      <h3 class="item_title">最近一周累计治愈</h3>
      <div id="cure" ref="cureRef" class="chartItem" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modules {
  background: #10152b;
  border-radius: 8px;
  padding: 8px 12px;

  &_nobg {
    background: transparent;
  }

  &_table {
    width: 100%;
    height: calc(100% - 40px);

    &.el-table {
      background: transparent !important;

      :deep(.el-table__inner-wrapper::before) {
        display: none;
      }

      :deep(.el-table__header) {
        width: 100% !important;
      }

      :deep(.el-table__body) {
        width: 100% !important
      }

      :deep(tr) {
        background: transparent !important;
      }

      :deep(td.el-table__cell) {
        border: none !important;
        background: transparent !important;

        .cell {
          color: #fff;
          line-height: unset;
        }
      }

      :deep(th.el-table__cell) {
        border: none !important;
        background: transparent !important;

        .cell {
          color: #fff;
          line-height: unset;
        }
      }
    }
  }

  .item_title {
    font-size: 18px;
    font-weight: 600;
    height: 30px;
    margin-bottom: 10px;
    color: #fff;
  }
}

.chartItem {
  width: 100%;
  height: calc(100% - 40px);
}

.pages {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-rows: 50px repeat(23, 1fr);
  grid-template-columns: repeat(24, 1fr);
  gap: 1rem;
  grid-auto-flow: row dense;

  h2 {
    font-size: 30px;
    font-weight: 600;
  }

  span {
    font-size: 14px;
  }

  .header {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    gap: 1rem;
  }

  .count_list {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }

  .count_num_item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .info {
      .text {
        margin-right: 10px;
      }

      // #d22e5a #63f662 #348be2
      &.bottom {

        .icon,
        .num {
          color: #d22e5a;
        }
      }

      &.top {

        .icon,
        .num {
          color: #63f662;
        }
      }

      &.danger {

        .icon,
        .num {
          color: #d22e5a;
        }
      }
    }
  }

  .count {
    font-size: 2.3rem;
    font-weight: 700;
    color: #fff;

    &.primary {
      color: #409eff;
    }

    &.danger {
      color: #d22e5a
    }
  }

}
</style>
