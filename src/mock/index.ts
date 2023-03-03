import Mock from 'mockjs'
import covid19 from './covid19'
import type { MockParams } from './types'

export const mocks = [ ...covid19 ]

Mock.setup({
  timeout: '300-1000'
})

// 初始化Mock数据
export const initMockData = () => {
  let i: MockParams
  for (i of mocks) {
    Mock.mock(new RegExp(i.url), i.type || 'get', i.response)
  }
}

