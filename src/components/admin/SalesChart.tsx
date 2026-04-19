'use client'

import React, { useState } from 'react'
import { formatPrice } from '@/lib/utils'

export interface MonthSalesData {
  month: number
  name: string
  fullName: string
  sold: number
  revenue: number
  consignmentSold: number
  consignmentRevenue: number
}

const BAR_AREA_HEIGHT = 148

export default function SalesChart({
  data,
  currentMonth,
  year,
}: {
  data: MonthSalesData[]
  currentMonth: number
  year: number
}) {
  const [active, setActive] = useState<number | null>(null)
  const activeData = active !== null ? data[active] : null
  const maxSold = Math.max(...data.map(d => d.sold), 1)

  return (
    <div className="space-y-3">
      {/* Hover info panel */}
      <div className="min-h-[44px] flex items-center">
        {activeData ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="font-semibold text-slate-800 text-sm">
              {activeData.fullName} {year}
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block shrink-0" />
              <span className="font-bold text-slate-700">{activeData.sold}</span>
              <span className="text-slate-400">predajov</span>
              {activeData.revenue > 0 && (
                <span className="text-slate-700 font-semibold ml-1">{formatPrice(activeData.revenue)}</span>
              )}
            </span>
            {activeData.consignmentSold > 0 && (
              <span className="flex items-center gap-1.5 text-sm">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-400 inline-block shrink-0" />
                <span className="font-bold text-purple-700">{activeData.consignmentSold}</span>
                <span className="text-slate-400">komisných</span>
                {activeData.consignmentRevenue > 0 && (
                  <span className="text-purple-600 font-semibold ml-1">{formatPrice(activeData.consignmentRevenue)}</span>
                )}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Prejdite myšou cez stĺpec pre detaily</span>
        )}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1" style={{ height: BAR_AREA_HEIGHT + 24 }}>
        {data.map((d, i) => {
          const totalPx = d.sold > 0
            ? Math.max(Math.round((d.sold / maxSold) * BAR_AREA_HEIGHT), 6)
            : 0
          const commPx =
            d.sold > 0 && d.consignmentSold > 0
              ? Math.max(Math.round((d.consignmentSold / d.sold) * totalPx), 3)
              : 0
          const isCurrent = d.month === currentMonth
          const isActive = active === i

          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center select-none cursor-default"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {/* Count label */}
              <div className="h-5 flex items-end justify-center mb-0.5">
                {d.sold > 0 && (
                  <span className={`text-[10px] font-bold leading-none ${
                    isCurrent ? 'text-orange-600' : 'text-slate-400'
                  }`}>
                    {d.sold}
                  </span>
                )}
              </div>

              {/* Bar */}
              {totalPx > 0 ? (
                <div
                  className="w-full rounded-t overflow-hidden flex flex-col-reverse"
                  style={{ height: totalPx }}
                >
                  {commPx > 0 && (
                    <div
                      className={`w-full shrink-0 transition-colors duration-150 ${
                        isActive ? 'bg-purple-500' : 'bg-purple-400'
                      }`}
                      style={{ height: commPx }}
                    />
                  )}
                  <div
                    className={`w-full flex-1 transition-colors duration-150 ${
                      isCurrent
                        ? isActive ? 'bg-orange-600' : 'bg-orange-500'
                        : isActive ? 'bg-orange-400' : 'bg-orange-300'
                    }`}
                  />
                </div>
              ) : (
                <div
                  className="w-full rounded-sm bg-slate-100"
                  style={{ height: 3 }}
                />
              )}

              {/* Month label */}
              <div className="h-6 flex items-center justify-center mt-1">
                <span className={`text-[10px] leading-none ${
                  isCurrent ? 'font-bold text-slate-700' : 'text-slate-400'
                }`}>
                  {d.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-orange-400" />
          <span className="text-xs text-slate-500">Vlastné predaje</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-purple-400" />
          <span className="text-xs text-slate-500">Komisné predaje</span>
        </div>
        <div className="ml-auto text-xs text-slate-400 font-semibold">{year}</div>
      </div>
    </div>
  )
}
