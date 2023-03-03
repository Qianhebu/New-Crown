import request from "@/service"

export const getOverall = () => {
  let url = `/api/covid-19/overall?_=${Math.random()}`

  return request({
    url,
    method: 'get'
  })
}

export const getProvinceDataList = () => {
  let url = `/api/covid-19/area/latest/list?_=${Math.random()}`
  
  return request({
    url,
    method: 'get'
  })
}

export const getDailyList = () => {
  let url = `/api/covid-19/list?t=${Math.random()}`
  
  return request({
    url,
    method: 'get'
  })
}

export const getAllData = () => {
  let url = `/api/covid-19/allData?t=${Math.random()}`
  
  return request({
    url,
    method: 'get'
  })
}