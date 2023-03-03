import provinceData from '@/data/covid19-province.json'
import dailyData from '@/data/covid19-daily-list.json'
import allData from '@/data/data.json'
import Mock from 'mockjs'

const Random = Mock.Random

export default [
  {
    url: '/api/covid-19/overall',
    type: 'get',
    response: (config: any) => {
      return {
        success: true,
        code: 200,
        message: "操作成功",
        data: {
          // suspectIncr: 0,
          // suspectCount: 2,
          list: [
            { name: '现有确诊', icon: 'CaretBottom', count: Random.integer(3000, 4000), num: -100, countColor: 'primary' },
            { name: '累计确诊', icon: 'CaretTop',  count: Random.integer(110000, 120000), num: 72 },
            { name: '境外输入', icon: 'CaretTop',  count: Random.integer(6000, 8000), num: 23 },
            { name: '无症状感染者', icon: 'CaretTop',  count: Random.integer(600, 2000), num: 8 },
            { name: '累计治愈', icon: 'CaretTop',  count: Random.integer(100000, 110000), num: 173 },
            { name: '累计死亡', icon: 'CaretTop', count: Random.integer(4000, 6000), num: 12, countColor: 'danger' },
          ],
          confirmedCount: Random.integer(130000, 160000),
          currentConfirmedCount: Random.integer(6000, 9000),
          importedCount: Random.integer(20000, 43000),
          curedCount: Random.integer(100000, 130000),
          updateTime: Random.now('yyyy-MM-dd HH:mm:ss'),
          curedRate: Random.float(90, 95, 0, 2) / 100,
          deadRate: Random.float(1, 8, 0, 2) / 100
        }
      }
    }
  },
  {
    url: '/api/covid-19/area/latest/list',
    type: 'get',
    response: (config: any) => {
      return provinceData
    }
  },
  {
    url: '/api/covid-19/list',
    type: 'get',
    response: (config: any) => {
      return dailyData
    }
  },
  {
    url: '/api/covid-19/allData',
    type: 'get',
    response: (config: any) => {
      return allData
    }
  }
]