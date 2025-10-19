'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

// CustomSliderProps の定義は削除します

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  progress, // ここで progress を受け取る
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { progress?: number }) { // ここで型定義を拡張

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  // progressに応じて色クラスを決定
  const rangeColorClass =
    progress === undefined // progressが渡されない場合はデフォルトのbg-primary
      ? 'bg-primary'
      : progress < 30
      ? "bg-red-500" // 0-29%
      : progress < 70
      ? "bg-yellow-500" // 30-69%
      : progress < 100
      ? "bg-green-500" // 70-99%
      : "bg-blue-500"; // 100%

  // サム（ツマミ）のボーダーの色も進捗度で変えるならここも変更
  const thumbBorderClass =
    progress === undefined
      ? 'border-primary' // progressが渡されない場合はデフォルト
      : progress < 30
      ? "border-red-500"
      : progress < 70
      ? "border-yellow-500"
      : progress < 100
      ? "border-green-500"
      : "border-blue-500";

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={
          'bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
        }
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full transition-colors duration-300',
            rangeColorClass
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
            thumbBorderClass
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }