import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'workload.items.index': { paramsTuple?: []; params?: {} }
    'workload.items.store': { paramsTuple?: []; params?: {} }
    'workload.items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.items.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.items.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.plans.index': { paramsTuple?: []; params?: {} }
    'workload.plans.store': { paramsTuple?: []; params?: {} }
    'workload.plans.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.plans.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.plans.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.is_authenticated': { paramsTuple?: []; params?: {} }
    'health_checks': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'workload.items.index': { paramsTuple?: []; params?: {} }
    'workload.items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.plans.index': { paramsTuple?: []; params?: {} }
    'workload.plans.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.is_authenticated': { paramsTuple?: []; params?: {} }
    'health_checks': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'workload.items.store': { paramsTuple?: []; params?: {} }
    'workload.plans.store': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'workload.items.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.plans.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'workload.items.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workload.plans.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'auth.is_authenticated': { paramsTuple?: []; params?: {} }
    'health_checks': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}